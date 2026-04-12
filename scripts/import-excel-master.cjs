const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const SOURCE_XLSX = 'C:/Users/waron hospital/Downloads/PBO (TINDAKAN)  (1).xlsx';
const OUTPUT_JSON = path.join(__dirname, '..', 'api', '_lib', 'excel-master-data.json');

const ROOM_CLASSES = ['KELAS III', 'KELAS II', 'KELAS I', 'VIP', 'VVIP', 'PENTHOUSE'];

function clean(value) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function toNumber(value) {
  const raw = clean(value);
  if (!raw || raw === '-' || /^optional$/i.test(raw)) return 0;
  const normalized = raw
    .replace(/rp\.?/gi, '')
    .replace(/[^0-9-]/g, '');
  const num = Number.parseInt(normalized, 10);
  return Number.isFinite(num) ? num : 0;
}

function hasAnyPrice(row) {
  return [3, 4, 5, 6, 7, 8].some((idx) => toNumber(row[idx]) > 0);
}

function isLikelyTitle(text) {
  if (!text) return false;
  const t = text.toUpperCase();
  if (t.includes('JANGAN HAPUS') || t.includes('KETERANGAN')) return false;
  if (t.includes('PERKIRAAN BIAYA')) return false;
  if (t.length < 3) return false;
  return true;
}

function getNearestTitle(rows, startIndex) {
  for (let i = startIndex; i >= 0 && i >= startIndex - 8; i--) {
    const candidate = clean(rows[i]?.[0]);
    if (isLikelyTitle(candidate)) return candidate;
  }
  return '';
}

function parseMasterData(rows) {
  let headerIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || [];
    if (clean(row[0]).toUpperCase() === 'CATEGORY') {
      headerIndex = i;
      break;
    }
  }

  const golonganTariffs = {};
  if (headerIndex >= 0) {
    for (let i = headerIndex + 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const label = clean(row[0]);
      if (!/^golongan/i.test(label)) continue;
      golonganTariffs[label.toUpperCase()] = {
        'KELAS III': toNumber(row[1]),
        'KELAS II': toNumber(row[2]),
        'KELAS I': toNumber(row[3]),
        'VIP': toNumber(row[4]),
        'VVIP': toNumber(row[5]),
        'PENTHOUSE': toNumber(row[6]),
      };
    }
  }

  return {
    roomClasses: ROOM_CLASSES,
    golonganTariffs,
  };
}

function extractProcedureBlocks(sheetName, rows) {
  const procedures = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || [];
    const cell1 = clean(row[1]).toUpperCase();

    if (cell1 !== 'GOLONGAN OPERASI') continue;

    const title = getNearestTitle(rows, i) || sheetName;
    let golongan = '';
    let totalByClass = null;
    const items = [];

    for (let j = i + 1; j < rows.length; j++) {
      const r = rows[j] || [];
      const firstCol = clean(r[0]).toUpperCase();
      const secondCol = clean(r[1]);

      if (!golongan && /^golongan/i.test(secondCol)) {
        golongan = secondCol;
      }

      // End of this block when another title block starts with same marker
      if (j > i + 2 && clean(r[1]).toUpperCase() === 'GOLONGAN OPERASI') {
        break;
      }

      // Stop after totals captured and several empty rows
      if (/^total pbo$/i.test(firstCol) || /^total pbo$/i.test(secondCol)) {
        totalByClass = {
          'KELAS III': toNumber(r[3]),
          'KELAS II': toNumber(r[4]),
          'KELAS I': toNumber(r[5]),
          'VIP': toNumber(r[6]),
          'VVIP': toNumber(r[7]),
          'PENTHOUSE': toNumber(r[8]),
        };
        continue;
      }

      if (!secondCol) continue;
      if (/^golongan operasi$/i.test(secondCol)) continue;
      if (/^identitas pasien$/i.test(secondCol)) continue;
      if (/^total|^max estimasi|^min estimasi|^catatan/i.test(secondCol)) continue;

      if (hasAnyPrice(r)) {
        items.push({
          name: secondCol,
          quantity: toNumber(r[2]) || 1,
          prices: {
            'KELAS III': toNumber(r[3]),
            'KELAS II': toNumber(r[4]),
            'KELAS I': toNumber(r[5]),
            'VIP': toNumber(r[6]),
            'VVIP': toNumber(r[7]),
            'PENTHOUSE': toNumber(r[8]),
          },
        });
      }
    }

    if (!items.length && !totalByClass) continue;

    procedures.push({
      sheetName,
      name: title,
      golongan: golongan || 'Golongan II',
      classTariffs: totalByClass,
      items,
    });
  }

  return procedures;
}

function toProcedureModel(proc, index, masterGolongan) {
  const itemByName = (pattern) => {
    const found = proc.items.find((x) => pattern.test(x.name.toLowerCase()));
    if (!found) return 0;
    return found.prices['KELAS I'] || found.prices['KELAS II'] || found.prices['KELAS III'] || 0;
  };

  const classTariffs = proc.classTariffs || masterGolongan[proc.golongan.toUpperCase()] || null;
  const baseTariff = classTariffs?.['KELAS I'] || 0;

  const roomRow = proc.items.find((x) => /in patient room|tarif kamar|kamar/i.test(x.name.toLowerCase()));

  return {
    id: `PROC-${String(index + 1).padStart(4, '0')}`,
    name: proc.name,
    category: proc.sheetName,
    gol: proc.golongan,
    days: roomRow ? Math.max(1, Math.round(roomRow.quantity || 1)) : 1,
    op: itemByName(/jasmed dokter operator|dokter operator|operator/),
    ok: itemByName(/operation room|labor & delivery room|sewa kamar ok|kamar ok|vk/),
    alat: itemByName(/sewa alat/),
    obat: itemByName(/bmhp|farmasi/),
    kamar: itemByName(/in patient room|tarif kamar|baby room/),
    visite: proc.items
      .filter((x) => /visite/i.test(x.name.toLowerCase()))
      .reduce((sum, x) => sum + (x.prices['KELAS I'] || 0), 0),
    admin: itemByName(/administrasi|admin/),
    baseTariff,
    classTariffs,
    sourceSheet: proc.sheetName,
    lineItems: proc.items,
  };
}

function looksLikeDoctorName(text) {
  const t = clean(text);
  if (!t) return false;
  const low = t.toLowerCase();
  if (!low.includes('dr')) return false;
  if (/[+]|estimasi|asha|laparotomi|keterangan|catatan/.test(low)) return false;
  if (low.includes('jasa') || low.includes('dokter operator') || low.includes('dokter anak') || low.includes('visite')) return false;
  if (!/^(dr\.?|drg\.?|prof\.?)/i.test(t)) return false;
  return /(dr\.?\s|sp\.|subsp\.|f-mas|drg\.)/i.test(t);
}

function classifyDoctor(text) {
  const t = clean(text).toLowerCase();
  if (/\bsp\.?\s*a\b|subsp\.?\s*neo|dokter anak/.test(t)) return 'anak';
  if (/pendamping|asisten/.test(t)) return 'asisten';
  return 'dpjp';
}

function extractDoctorDirectory(allRowsBySheet) {
  const directory = {
    dpjp: new Set(),
    anak: new Set(),
    asisten: new Set(['Tanpa Asisten']),
  };

  Object.values(allRowsBySheet).forEach((rows) => {
    rows.forEach((row) => {
      row.forEach((cell) => {
        const name = clean(cell);
        if (!looksLikeDoctorName(name)) return;
        const group = classifyDoctor(name);
        directory[group].add(name);
      });
    });
  });

  return {
    dpjp: Array.from(directory.dpjp).sort(),
    anak: Array.from(directory.anak).sort(),
    asisten: Array.from(directory.asisten).sort(),
  };
}

function main() {
  if (!fs.existsSync(SOURCE_XLSX)) {
    throw new Error(`Excel file not found: ${SOURCE_XLSX}`);
  }

  const wb = XLSX.readFile(SOURCE_XLSX, { cellDates: false });

  const allRowsBySheet = {};
  wb.SheetNames.forEach((name) => {
    const ws = wb.Sheets[name];
    allRowsBySheet[name] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
  });

  const masterSheetRows = allRowsBySheet['MASTER DATA'] || [];
  const masterData = parseMasterData(masterSheetRows);
  const doctors = extractDoctorDirectory(allRowsBySheet);

  const procedureBlocks = [];
  wb.SheetNames.forEach((name) => {
    if (name === 'MASTER DATA' || name === 'Data Admin Role' || name === 'CAMPURAN MASTER DATA' || name === 'PBO MANUAL' || name === 'IPM' || name === 'PBO IPM UBAH DISINI') {
      return;
    }
    const rows = allRowsBySheet[name] || [];
    const blocks = extractProcedureBlocks(name, rows);
    procedureBlocks.push(...blocks);
  });

  // Deduplicate by (name + sheet)
  const dedup = new Map();
  for (const block of procedureBlocks) {
    const key = `${block.name}::${block.sheetName}`;
    if (!dedup.has(key)) dedup.set(key, block);
  }

  const procedures = Array.from(dedup.values()).map((p, idx) =>
    toProcedureModel(p, idx, masterData.golonganTariffs),
  );

  const output = {
    generatedAt: new Date().toISOString(),
    sourceFile: SOURCE_XLSX,
    sheetNames: wb.SheetNames,
    roomClasses: masterData.roomClasses,
    golonganTariffs: masterData.golonganTariffs,
    doctors,
    procedures,
    procedureCount: procedures.length,
    classMultipliers: {
      'KELAS III': 1,
      'KELAS II': 1.25,
      'KELAS I': 1.5,
      VIP: 1.75,
      VVIP: 2,
      PENTHOUSE: 2.5,
      ODC: 0.8,
    },
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));
  console.log(`Imported ${procedures.length} procedures from Excel.`);
  console.log(`Output: ${OUTPUT_JSON}`);
}

main();
