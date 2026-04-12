import { getDriveClient, getDriveFolderId, getSheetsClient, getSpreadsheetId } from './google.js';
import {
  loadLocalDatabase,
  extractUsersLocal,
  extractProceduresLocal,
  extractClassMultipliersLocal,
  getDoctorMultiplierLocal,
} from './local-db.js';
import {
  getMemoryDB,
} from './memory-db.js';

const DEFAULT_CLASSES = ['KELAS III', 'KELAS II', 'KELAS I', 'VIP', 'VVIP', 'PENTHOUSE', 'ODC'];

function normalizeKey(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function toObjects(values = []) {
  if (!values.length) return [];
  const [headers, ...rows] = values;
  const normalized = headers.map((h, i) => normalizeKey(h) || `col_${i + 1}`);

  return rows
    .filter((row) => row.some((cell) => String(cell || '').trim() !== ''))
    .map((row) => {
      const obj = {};
      normalized.forEach((key, i) => {
        obj[key] = row[i] ?? '';
      });
      return obj;
    });
}

function toNumber(value, fallback = 0) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  const normalized = String(value || '')
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.-]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function pickField(row, candidates) {
  for (const key of candidates) {
    if (row[key] !== undefined && row[key] !== '') return row[key];
  }
  return '';
}

function pickNumber(row, candidates, fallback = 0) {
  return toNumber(pickField(row, candidates), fallback);
}

function matchSheetName(sheetName, keywords) {
  const name = normalizeKey(sheetName);
  return keywords.some((keyword) => name.includes(normalizeKey(keyword)));
}

function simplifyProcedure(row, index) {
  const id = String(
    pickField(row, ['id', 'kode', 'procedure_id', 'tindakan_id']) || `PROC-${index + 1}`,
  );

  const name = String(
    pickField(row, ['name', 'nama_tindakan', 'tindakan', 'procedure', 'nama']) || `Tindakan ${index + 1}`,
  );

  const category = String(pickField(row, ['category', 'kategori', 'departemen', 'bagian']) || 'Umum');
  const gol = String(pickField(row, ['gol', 'golongan']) || 'GOL I');
  const days = pickNumber(row, ['days', 'hari', 'length_of_stay', 'rawat_hari'], 1);

  const op = pickNumber(row, ['op', 'tarif_op', 'jasa_operator', 'operator']);
  const ok = pickNumber(row, ['ok', 'tarif_ok', 'jasa_ok']);
  const alat = pickNumber(row, ['alat', 'alat_kesehatan', 'bahan_habis_pakai']);
  const obat = pickNumber(row, ['obat', 'farmasi', 'obat_obatan']);
  const kamar = pickNumber(row, ['kamar', 'tarif_kamar']);
  const visite = pickNumber(row, ['visite', 'visit', 'visite_dokter']);
  const admin = pickNumber(row, ['admin', 'administrasi']);
  const baseTariff = pickNumber(row, ['base_tariff', 'tarif', 'tarif_total', 'total']);

  return {
    id,
    name,
    category,
    gol,
    days,
    op,
    ok,
    alat,
    obat,
    kamar,
    visite,
    admin,
    baseTariff,
  };
}

export async function loadSpreadsheetDatabase() {
  // Priority 1: In-memory database (Vercel serverless)
  if (process.env.USE_IN_MEMORY_DB === 'true') {
    console.log('⚡ Using in-memory database (USE_IN_MEMORY_DB=true)');
    const memDb = getMemoryDB();
    return {
      isMemory: true,
      spreadsheetId: 'MEMORY_DB',
      sheets: {
        users: memDb.users || [],
        procedures: memDb.procedures || [],
      },
      sheetNames: memDb.sheetNames || ['users', 'procedures'],
      classMultipliers: memDb.classMultipliers || {},
      golonganTariffs: memDb.golonganTariffs || {},
      doctorMultipliers: { standard: 1.0, specialist: 1.3, consultant: 1.5 },
    };
  }

  // Priority 2: Local database file
  if (process.env.USE_LOCAL_DB === 'true') {
    console.log('📁 Using local database (USE_LOCAL_DB=true)');
    const localDb = await loadLocalDatabase();
    if (localDb) {
      return {
        isLocal: true,
        spreadsheetId: 'LOCAL_DB',
        sheets: {
          users: extractUsersLocal(localDb),
          procedures: extractProceduresLocal(localDb),
        },
        sheetNames: ['users', 'procedures'],
        classMultipliers: extractClassMultipliersLocal(localDb),
        doctorMultipliers: localDb.doctorMultipliers || {},
      };
    }
  }

  // Priority 3: Google Sheets (optional)
  try {
    console.log('☁️ Using Google Sheets database');
    const sheets = getSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetTitles = (meta.data.sheets || []).map((s) => s.properties?.title).filter(Boolean);

    const reads = await Promise.all(
      sheetTitles.map(async (title) => {
        const range = `'${title.replace(/'/g, "''")}'`;
        const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
        return [title, toObjects(res.data.values || [])];
      }),
    );

    const map = Object.fromEntries(reads);
    return { spreadsheetId, sheets: map, sheetNames: sheetTitles };
  } catch (error) {
    console.error('❌ Google Sheets error:', error.message);
    // Fallback to memory database if available
    if (process.env.USE_IN_MEMORY_DB !== 'false') {
      console.log('⚠️ Falling back to in-memory database');
      const memDb = getMemoryDB();
      return {
        isMemory: true,
        spreadsheetId: 'MEMORY_DB',
        sheets: {
          users: memDb.users || [],
          procedures: memDb.procedures || [],
        },
        sheetNames: memDb.sheetNames || ['users', 'procedures'],
        classMultipliers: memDb.classMultipliers || {},
        golonganTariffs: memDb.golonganTariffs || {},
        doctorMultipliers: { standard: 1.0, specialist: 1.3, consultant: 1.5 },
      };
    }
    throw new Error('Failed to load database. Please check your environment configuration.');
  }
}

export async function loadDriveFiles(limit = 20) {
  const folderId = getDriveFolderId();
  if (!folderId) return [];

  const drive = getDriveClient();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id,name,mimeType,webViewLink,modifiedTime,size)',
    pageSize: Math.max(1, Math.min(limit, 100)),
    orderBy: 'modifiedTime desc',
  });

  return (res.data.files || []).map((file) => ({
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    webViewLink: file.webViewLink,
    modifiedTime: file.modifiedTime,
    size: toNumber(file.size, 0),
  }));
}

export function extractUsers(db) {
  const userSheets = db.sheetNames.filter((name) =>
    matchSheetName(name, ['user', 'login', 'akun', 'account', 'staff']),
  );

  const rows = userSheets.flatMap((name) => db.sheets[name] || []);

  return rows
    .map((row) => ({
      username: String(pickField(row, ['username', 'user', 'email', 'nik'])).trim(),
      password: String(pickField(row, ['password', 'pass', 'kata_sandi'])).trim(),
      role: String(pickField(row, ['role', 'jabatan', 'akses']) || 'staff').toLowerCase(),
      name: String(pickField(row, ['name', 'nama', 'full_name']) || '').trim(),
    }))
    .filter((u) => u.username && u.password);
}

export function extractProcedures(db) {
  if (db.isMemory && Array.isArray(db.sheets?.procedures)) {
    return db.sheets.procedures;
  }

  const candidateSheets = db.sheetNames.filter((name) =>
    matchSheetName(name, ['tindakan', 'procedure', 'tarif', 'master']),
  );

  const rows = candidateSheets.flatMap((name) => db.sheets[name] || []);

  const procedures = rows
    .map((row, index) => simplifyProcedure(row, index))
    .filter((item) => item.name && item.id);

  const dedup = new Map();
  procedures.forEach((item) => {
    if (!dedup.has(item.id)) {
      dedup.set(item.id, item);
    }
  });

  return Array.from(dedup.values());
}

export function extractClassMultipliers(db) {
  if (db.isMemory && db.classMultipliers) {
    return db.classMultipliers;
  }

  const classSheets = db.sheetNames.filter((name) => matchSheetName(name, ['kelas', 'class', 'multiplier']));
  const rows = classSheets.flatMap((name) => db.sheets[name] || []);

  const map = {};
  rows.forEach((row) => {
    const className = String(pickField(row, ['kelas', 'class', 'nama_kelas', 'room_class'])).trim().toUpperCase();
    if (!className) return;

    const multiplier = pickNumber(row, ['multiplier', 'koefisien', 'faktor'], 1);
    map[className] = multiplier || 1;
  });

  DEFAULT_CLASSES.forEach((kelas) => {
    if (!map[kelas]) map[kelas] = 1;
  });

  return map;
}

export function calculatePbo(params, db) {
  const procedures = extractProcedures(db);
  if (!procedures.length) {
    throw new Error('Data tindakan tidak ditemukan di spreadsheet.');
  }

  const classMultipliers = extractClassMultipliers(db);
  const selectedProcedure = procedures.find((item) => item.id === params.procedureId);

  if (!selectedProcedure) {
    throw new Error('Tindakan tidak ditemukan.');
  }

  const className = String(params.className || 'KELAS III').toUpperCase();
  const classMultiplier = classMultipliers[className] || 1;
  const doctorMultiplier = toNumber(params.doctorMultiplier, 1) || 1;
  const days = Math.max(0, Math.round(toNumber(params.days, selectedProcedure.days || 1)));
  const addonsTotal = toNumber(params.addonsTotal, 0);

  // Excel master mode: use direct tariff per class as main reference.
  const tariffByClass = selectedProcedure.classTariffs?.[className];
  if (tariffByClass && tariffByClass > 0) {
    const subtotal = tariffByClass;
    const afterMultiplier = subtotal * doctorMultiplier;
    const total = Math.round(afterMultiplier + addonsTotal);

    return {
      procedure: selectedProcedure,
      className,
      classMultiplier: 1,
      doctorMultiplier,
      days,
      breakdown: {
        operator: selectedProcedure.op || 0,
        alat: selectedProcedure.alat || 0,
        obat: selectedProcedure.obat || 0,
        kamar: selectedProcedure.kamar * days || 0,
        visite: selectedProcedure.visite * days || 0,
        admin: selectedProcedure.admin || 0,
        addons: addonsTotal,
        subtotal,
        afterMultiplier,
        total,
      },
    };
  }

  const baseOperator = selectedProcedure.baseTariff > 0 ? selectedProcedure.baseTariff : selectedProcedure.op + selectedProcedure.ok;
  const roomTotal = selectedProcedure.kamar * days;
  const visiteTotal = selectedProcedure.visite * days;

  const subtotal =
    baseOperator +
    selectedProcedure.alat +
    selectedProcedure.obat +
    roomTotal +
    visiteTotal +
    selectedProcedure.admin;

  const afterMultiplier = subtotal * classMultiplier * doctorMultiplier;
  const total = Math.round(afterMultiplier + addonsTotal);

  return {
    procedure: selectedProcedure,
    className,
    classMultiplier,
    doctorMultiplier,
    days,
    breakdown: {
      operator: baseOperator,
      alat: selectedProcedure.alat,
      obat: selectedProcedure.obat,
      kamar: roomTotal,
      visite: visiteTotal,
      admin: selectedProcedure.admin,
      addons: addonsTotal,
      subtotal,
      afterMultiplier,
      total,
    },
  };
}

export function buildBootstrapPayload(db, driveFiles = []) {
  let procedures, classMultipliers;

  // Handle any database type (memory, local, or sheets)
  if (db.isMemory || db.isLocal) {
    procedures = db.sheets.procedures || [];
    classMultipliers = db.classMultipliers || {};
  } else {
    // Handle Google Sheets
    procedures = extractProcedures(db);
    classMultipliers = extractClassMultipliers(db);
  }

  const totalTarif = procedures.reduce((acc, p) => acc + (p.baseTariff || p.op + p.ok), 0);
  const avgTarif = procedures.length ? Math.round(totalTarif / procedures.length) : 0;

  return {
    spreadsheetId: db.spreadsheetId,
    sheetNames: db.sheetNames,
    procedures,
    classes: Object.keys(classMultipliers),
    classMultipliers,
    golonganTariffs: db.golonganTariffs || {},
    metrics: {
      totalProcedures: procedures.length,
      totalSheets: db.sheetNames.length,
      averageTariff: avgTarif,
      driveFiles: driveFiles.length,
      dataSource: db.isMemory ? 'In-Memory (Vercel)' : (db.isLocal ? 'Local JSON' : 'Google Sheets'),
    },
    driveFiles,
  };
}
