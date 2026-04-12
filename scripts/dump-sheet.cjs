const XLSX = require('xlsx');

const workbookPath = 'C:/Users/waron hospital/Downloads/PBO (TINDAKAN)  (1).xlsx';
const sheetName = process.argv[2];
if (!sheetName) {
  console.error('Usage: node scripts/dump-sheet.cjs "Sheet Name"');
  process.exit(1);
}

const wb = XLSX.readFile(workbookPath, { cellDates: false });
const ws = wb.Sheets[sheetName];
if (!ws) {
  console.error(`Sheet not found: ${sheetName}`);
  process.exit(1);
}

const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
for (let i = 0; i < Math.min(rows.length, 180); i++) {
  const row = rows[i] || [];
  const nonEmpty = row.some((c) => String(c).trim() !== '');
  if (!nonEmpty) continue;
  const preview = row.slice(0, 16).map((c) => String(c).trim());
  console.log(String(i).padStart(4, '0'), JSON.stringify(preview));
}
