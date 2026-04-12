import { issueToken } from './_lib/auth.js';
import { extractUsers, loadSpreadsheetDatabase } from './_lib/data.js';
import { addAuditLog } from './_lib/audit.js';
import { getRole } from './_lib/rbac.js';

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

  const body = readBody(req);

  try {
    const username = String(body.username || '').trim();
    const password = String(body.password || '').trim();

    if (!username || !password) {
      res.status(400).json({ message: 'Username dan password wajib diisi.' });
      return;
    }

    const db = await loadSpreadsheetDatabase();
    const users = extractUsers(db);

    let user = users.find((item) => item.username === username && item.password === password);

    if (!user) {
      const fallbackUser = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
      const fallbackPass = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
      if (username === fallbackUser && password === fallbackPass) {
        user = {
          username,
          password,
          role: 'admin',
          name: 'Administrator',
        };
      }
    }

    if (!user) {
      addAuditLog({
        type: 'LOGIN',
        username: username,
        action: 'Failed login attempt',
        status: 'error',
      });
      res.status(401).json({ message: 'Username atau password tidak valid.' });
      return;
    }

    const roleData = getRole(user.role || 'staff');
    const safeUser = {
      username: user.username,
      role: user.role || 'staff',
      name: user.name || user.username,
      permissions: roleData.permissions,
    };

    addAuditLog({
      type: 'LOGIN',
      username: user.username,
      role: safeUser.role,
      action: 'Successful login',
      status: 'success',
    });

    const token = issueToken(safeUser);
    res.status(200).json({
      token,
      user: safeUser,
      loginTime: new Date().toISOString(),
    });
  } catch (error) {
    addAuditLog({
      type: 'LOGIN',
      username: body.username || 'unknown',
      action: 'Login error',
      details: { error: error.message },
      status: 'error',
    });
    res.status(500).json({ message: error.message || 'Gagal login.' });
  }
}
