import { requireAuth } from './_lib/auth.js';
import { buildBootstrapPayload, loadDriveFiles, loadSpreadsheetDatabase } from './_lib/data.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method tidak diizinkan.' });
    return;
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const db = await loadSpreadsheetDatabase();
    const driveFiles = await loadDriveFiles(24);
    const payload = buildBootstrapPayload(db, driveFiles);

    res.status(200).json({
      generatedAt: new Date().toISOString(),
      user: auth,
      ...payload,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Gagal memuat data dashboard.' });
  }
}
