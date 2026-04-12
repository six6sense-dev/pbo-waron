const fs = require('fs');
const XLSX = require('xlsx');

const workbookPath = 'C:/Users/waron hospital/Downloads/PBO (TINDAKAN)  (1).xlsx';
const outPath = 'scripts/excel-analysis.json';

const wb = XLSX.readFile(workbookPath, { cellDates: false });

function clean(v) {
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

const result = {
  sheetNames: wb.SheetNames,
  sheets: {},
};

for (const sheetName of wb.SheetNames) {
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });

  const keywordRows = [];
  rows.forEach((row, idx) => {
    const cells = row.map(clean).filter(Boolean);
    if (!cells.length) return;
    const text = cells.join(' | ').toLowerCase();
    if (/\bno\b|tindakan|tarif|kelas|golongan|gol\.?\b|biaya|total|kamar/.test(text)) {
      keywordRows.push({
        index: idx,
        row: row.slice(0, 20),
      });
    }
  });

  result.sheets[sheetName] = {
    rowCount: rows.length,
    firstRows: rows.slice(0, 80).map((r) => r.slice(0, 20)),
    keywordRows: keywordRows.slice(0, 80),
  };
}

fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(`Wrote analysis to ${outPath}`);
