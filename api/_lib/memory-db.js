// In-Memory Database for Production (Vercel Serverless)
// Data persists per function execution, resets on cold start/redeploy

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

function loadExcelMasterData() {
  try {
    const fileDir = dirname(fileURLToPath(import.meta.url));
    const jsonPath = join(fileDir, 'excel-master-data.json');
    const text = readFileSync(jsonPath, 'utf8');
    const parsed = JSON.parse(text);
    return parsed;
  } catch {
    return null;
  }
}

const excelMaster = loadExcelMasterData();

const DEFAULT_PROCEDURES = Array.isArray(excelMaster?.procedures) && excelMaster.procedures.length
  ? excelMaster.procedures
  : [];

const DEFAULT_CLASS_MULTIPLIERS = excelMaster?.classMultipliers || {
  'KELAS III': 1.0,
  'KELAS II': 1.25,
  'KELAS I': 1.5,
  VIP: 1.75,
  VVIP: 2.0,
  PENTHOUSE: 2.5,
  ODC: 0.8,
};

// In-memory storage
let memoryDB = {
  users: JSON.parse(JSON.stringify(DEFAULT_USERS)),
  procedures: JSON.parse(JSON.stringify(DEFAULT_PROCEDURES)),
  classMultipliers: JSON.parse(JSON.stringify(DEFAULT_CLASS_MULTIPLIERS)),
  sheetNames: Array.isArray(excelMaster?.sheetNames) ? excelMaster.sheetNames : ['MEMORY_DB'],
  golonganTariffs: excelMaster?.golonganTariffs || {},
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
    sheetNames: Array.isArray(excelMaster?.sheetNames) ? excelMaster.sheetNames : ['MEMORY_DB'],
    golonganTariffs: excelMaster?.golonganTariffs || {},
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
