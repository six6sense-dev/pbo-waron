// In-Memory Database for Production (Vercel Serverless)
// Data persists per function execution, resets on redeploy

const DEFAULT_USERS = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrator',
  },
  {
    username: 'keuangan',
    password: 'keuangan123',
    role: 'finance',
    name: 'Staff Keuangan',
  },
  {
    username: 'dokter',
    password: 'dokter123',
    role: 'doctor',
    name: 'Dr. Andi',
  },
  {
    username: 'staff',
    password: 'staff123',
    role: 'staff',
    name: 'Staff Rumah Sakit',
  },
];

const DEFAULT_PROCEDURES = [
  {
    id: 'PROC-001',
    name: 'Operasi Appendix',
    category: 'Bedah',
    gol: 'GOL I',
    days: 3,
    op: 2500000,
    ok: 1500000,
    alat: 800000,
    obat: 400000,
    kamar: 300000,
    visite: 200000,
    admin: 100000,
    baseTariff: 6200000,
  },
  {
    id: 'PROC-002',
    name: 'Operasi Hernia',
    category: 'Bedah',
    gol: 'GOL II',
    days: 2,
    op: 2000000,
    ok: 1200000,
    alat: 600000,
    obat: 300000,
    kamar: 200000,
    visite: 150000,
    admin: 80000,
    baseTariff: 4530000,
  },
  {
    id: 'PROC-003',
    name: 'Operasi Caesar',
    category: 'Obstetri',
    gol: 'GOL I',
    days: 3,
    op: 3000000,
    ok: 2000000,
    alat: 1000000,
    obat: 500000,
    kamar: 300000,
    visite: 250000,
    admin: 150000,
    baseTariff: 7200000,
  },
  {
    id: 'PROC-004',
    name: 'Persalinan Normal',
    category: 'Obstetri',
    gol: 'GOL III',
    days: 1,
    op: 1000000,
    ok: 500000,
    alat: 300000,
    obat: 200000,
    kamar: 150000,
    visite: 100000,
    admin: 50000,
    baseTariff: 2300000,
  },
  {
    id: 'PROC-005',
    name: 'Endoskopi GI',
    category: 'Gastro',
    gol: 'GOL II',
    days: 1,
    op: 800000,
    ok: 400000,
    alat: 300000,
    obat: 150000,
    kamar: 100000,
    visite: 80000,
    admin: 50000,
    baseTariff: 1880000,
  },
  {
    id: 'PROC-006',
    name: 'CT Scan Kepala',
    category: 'Radiologi',
    gol: 'GOL III',
    days: 0,
    op: 0,
    ok: 0,
    alat: 500000,
    obat: 50000,
    kamar: 0,
    visite: 100000,
    admin: 50000,
    baseTariff: 700000,
  },
  {
    id: 'PROC-007',
    name: 'USG Obstetri',
    category: 'Radiologi',
    gol: 'GOL III',
    days: 0,
    op: 0,
    ok: 0,
    alat: 200000,
    obat: 0,
    kamar: 0,
    visite: 50000,
    admin: 30000,
    baseTariff: 280000,
  },
  {
    id: 'PROC-008',
    name: 'Rawat Inap Gawat Darurat',
    category: 'ICU',
    gol: 'GOL I',
    days: 1,
    op: 500000,
    ok: 300000,
    alat: 400000,
    obat: 300000,
    kamar: 800000,
    visite: 200000,
    admin: 100000,
    baseTariff: 2600000,
  },
];

const DEFAULT_CLASS_MULTIPLIERS = {
  'KELAS III': 1.0,
  'KELAS II': 1.25,
  'KELAS I': 1.5,
  'VIP': 1.75,
  'VVIP': 2.0,
  'PENTHOUSE': 2.5,
  'ODC': 0.8,
};

// In-memory storage
let memoryDB = {
  users: JSON.parse(JSON.stringify(DEFAULT_USERS)),
  procedures: JSON.parse(JSON.stringify(DEFAULT_PROCEDURES)),
  classMultipliers: JSON.parse(JSON.stringify(DEFAULT_CLASS_MULTIPLIERS)),
  auditLogs: [],
};

export function getMemoryDB() {
  return memoryDB;
}

export function resetMemoryDB() {
  memoryDB = {
    users: JSON.parse(JSON.stringify(DEFAULT_USERS)),
    procedures: JSON.parse(JSON.stringify(DEFAULT_PROCEDURES)),
    classMultipliers: JSON.parse(JSON.stringify(DEFAULT_CLASS_MULTIPLIERS)),
    auditLogs: [],
  };
  return memoryDB;
}

export function addAuditLogToMemory(entry) {
  memoryDB.auditLogs.push({
    ...entry,
    id: Date.now(),
    timestamp: new Date().toISOString(),
  });
  
  // Keep only last 10000 entries per function execution
  if (memoryDB.auditLogs.length > 10000) {
    memoryDB.auditLogs = memoryDB.auditLogs.slice(-10000);
  }
}

export function addUserToMemory(user) {
  const existing = memoryDB.users.find((u) => u.username === user.username);
  if (!existing) {
    memoryDB.users.push(user);
  }
  return memoryDB.users;
}

export function updateUserInMemory(username, updates) {
  const user = memoryDB.users.find((u) => u.username === username);
  if (user) {
    Object.assign(user, updates);
  }
  return memoryDB.users;
}

export function deleteUserFromMemory(username) {
  const newUsers = memoryDB.users.filter((u) => u.username !== username);
  memoryDB.users = newUsers;
  return memoryDB.users;
}
