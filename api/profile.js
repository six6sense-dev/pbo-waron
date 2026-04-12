import { requireAuth } from './_lib/auth.js';
import { getAllRoles } from './_lib/rbac.js';
import { addAuditLog } from './_lib/audit.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const auth = requireAuth(req, res);
    if (!auth) return;

    addAuditLog({
      type: 'LOGIN',
      username: auth.sub,
      role: auth.role,
      action: 'User logged out',
      status: 'success',
    });

    res.status(200).json({ message: 'Logout berhasil.' });
    return;
  }

  if (req.method === 'GET') {
    const auth = requireAuth(req, res);
    if (!auth) return;

    res.status(200).json({
      user: auth,
      roles: getAllRoles(),
    });
    return;
  }

  res.status(405).json({ message: 'Method tidak diizinkan.' });
}
