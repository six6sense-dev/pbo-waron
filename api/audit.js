import { requireAuth } from './_lib/auth.js';
import { checkPermission } from './_lib/rbac.js';
import { getAuditLogs, getAuditStats } from './_lib/audit.js';

export default async function handler(req, res) {
  const auth = requireAuth(req, res);
  if (!auth) return;

  if (!checkPermission(auth.role, 'view_audit_logs', res)) return;

  try {
    if (req.method === 'GET') {
      const { type, username, role, status, startDate, endDate, limit, offset } = req.query;
      const filter = {
        type,
        username,
        role,
        status,
        startDate,
        endDate,
        limit: limit ? parseInt(limit, 10) : 100,
        offset: offset ? parseInt(offset, 10) : 0,
      };

      const logs = getAuditLogs(filter);
      res.status(200).json(logs);
      return;
    }

    if (req.method === 'POST' && auth.role === 'admin') {
      const action = req.query.action || '';

      if (action === 'stats') {
        const stats = getAuditStats();
        res.status(200).json(stats);
        return;
      }

      res.status(400).json({ message: 'Invalid action' });
      return;
    }

    res.status(405).json({ message: 'Method tidak diizinkan.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Gagal memuat audit logs.' });
  }
}
