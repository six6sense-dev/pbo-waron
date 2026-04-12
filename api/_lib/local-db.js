import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

let cachedLocalData = null;

export async function loadLocalDatabase() {
  if (cachedLocalData) return cachedLocalData;
  
  try {
    const filePath = join(__dirname, '../../data-local.json');
    const content = await fs.readFile(filePath, 'utf-8');
    cachedLocalData = JSON.parse(content);
    console.log('✅ Local database loaded from data-local.json');
    return cachedLocalData;
  } catch (error) {
    console.error('❌ Failed to load local database:', error.message);
    return null;
  }
}

export async function saveLocalDatabase(data) {
  try {
    const filePath = join(__dirname, '../../data-local.json');
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    cachedLocalData = data;
    console.log('✅ Local database saved');
  } catch (error) {
    console.error('❌ Failed to save local database:', error.message);
    throw error;
  }
}

export function extractUsersLocal(db) {
  return (db.users || []).map((u) => ({
    username: u.username || '',
    password: u.password || '',
    role: u.role || 'staff',
    name: u.name || u.username || '',
  })).filter((u) => u.username && u.password);
}

export function extractProceduresLocal(db) {
  return (db.procedures || []).map((p) => ({
    id: p.id || '',
    name: p.name || '',
    category: p.category || 'Umum',
    gol: p.gol || 'GOL I',
    days: typeof p.days === 'number' ? p.days : 1,
    op: typeof p.op === 'number' ? p.op : 0,
    ok: typeof p.ok === 'number' ? p.ok : 0,
    alat: typeof p.alat === 'number' ? p.alat : 0,
    obat: typeof p.obat === 'number' ? p.obat : 0,
    kamar: typeof p.kamar === 'number' ? p.kamar : 0,
    visite: typeof p.visite === 'number' ? p.visite : 0,
    admin: typeof p.admin === 'number' ? p.admin : 0,
    baseTariff: typeof p.baseTariff === 'number' ? p.baseTariff : 0,
  })).filter((p) => p.name && p.id);
}

export function extractClassMultipliersLocal(db) {
  return db.classMultipliers || {
    'KELAS III': 1.0,
    'KELAS II': 1.25,
    'KELAS I': 1.5,
    'VIP': 1.75,
    'VVIP': 2.0,
    'PENTHOUSE': 2.5,
    'ODC': 0.8,
  };
}

export function getDoctorMultiplierLocal(doctorType, db) {
  const multipliers = db.doctorMultipliers || {
    'standard': 1.0,
    'specialist': 1.3,
    'consultant': 1.5,
  };
  return multipliers[doctorType] || 1.0;
}
