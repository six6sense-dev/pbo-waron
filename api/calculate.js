import { requireAuth } from './_lib/auth.js';
import { calculatePbo, loadSpreadsheetDatabase } from './_lib/data.js';
import { addAuditLog } from './_lib/audit.js';
import { checkPermission } from './_lib/rbac.js';

function readBody(req) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body || {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method tidak diizinkan.' });
    return;
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  if (!checkPermission(auth.role, 'advanced_calc', res)) return;

  try {
    const params = readBody(req);
    const db = await loadSpreadsheetDatabase();
    const result = calculatePbo(params, db);

    addAuditLog({
      type: 'CALCULATE',
      username: auth.sub,
      role: auth.role,
      action: 'PBO calculation performed',
      details: {
        procedureId: params.procedureId,
        className: params.className,
        totalAmount: result.breakdown.total,
      },
      status: 'success',
    });

    res.status(200).json({
      calculatedAt: new Date().toISOString(),
      requestedBy: auth.sub,
      ...result,
    });
  } catch (error) {
    addAuditLog({
      type: 'CALCULATE',
      username: auth.sub,
      role: auth.role,
      action: 'PBO calculation failed',
      details: { error: error.message },
      status: 'error',
    });
    res.status(400).json({ message: error.message || 'Gagal menghitung estimasi PBO.' });
  }
}
