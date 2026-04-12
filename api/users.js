import { requireAuth } from './_lib/auth.js';
import { checkPermission, getAllRoles } from './_lib/rbac.js';
import { extractUsers, loadSpreadsheetDatabase } from './_lib/data.js';
import { addAuditLog } from './_lib/audit.js';

let localUsers = [];

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

async function initUsers() {
  if (localUsers.length === 0) {
    try {
      const db = await loadSpreadsheetDatabase();
      const users = extractUsers(db);
      localUsers = users.map((user) => ({
        ...user,
        id: user.username,
        createdAt: new Date().toISOString(),
        lastLogin: null,
      }));
    } catch {
      localUsers = [];
    }
  }
  return localUsers;
}

export default async function handler(req, res) {
  const auth = requireAuth(req, res);
  if (!auth) return;

  if (!checkPermission(auth.role, 'manage_users', res)) return;

  try {
    await initUsers();

    if (req.method === 'GET') {
      res.status(200).json({
        users: localUsers,
        roles: getAllRoles(),
        currentUser: auth,
      });
      return;
    }

    if (req.method === 'POST') {
      const body = readBody(req);
      const action = req.query.action || 'create';

      if (action === 'create') {
        if (!body.username || !body.password || !body.name) {
          res.status(400).json({ message: 'Username, password, dan name wajib diisi.' });
          return;
        }

        const existing = localUsers.find((u) => u.username === body.username);
        if (existing) {
          res.status(409).json({ message: 'Username sudah terdaftar.' });
          return;
        }

        const newUser = {
          ...body,
          id: body.username,
          createdAt: new Date().toISOString(),
          lastLogin: null,
          role: body.role || 'staff',
        };

        localUsers.push(newUser);

        addAuditLog({
          type: 'ADMIN_ACTION',
          username: auth.sub,
          role: auth.role,
          action: 'Created new user',
          details: { targetUser: newUser.username, role: newUser.role },
          status: 'success',
        });

        res.status(201).json({ message: 'User berhasil dibuat.', user: newUser });
        return;
      }

      if (action === 'update') {
        const user = localUsers.find((u) => u.username === body.username);
        if (!user) {
          res.status(404).json({ message: 'User tidak ditemukan.' });
          return;
        }

        Object.assign(user, {
          ...body,
          id: body.username,
          username: user.username,
        });

        addAuditLog({
          type: 'ADMIN_ACTION',
          username: auth.sub,
          role: auth.role,
          action: 'Updated user',
          details: { targetUser: user.username },
          status: 'success',
        });

        res.status(200).json({ message: 'User berhasil diupdate.', user });
        return;
      }

      if (action === 'delete') {
        const index = localUsers.findIndex((u) => u.username === body.username);
        if (index === -1) {
          res.status(404).json({ message: 'User tidak ditemukan.' });
          return;
        }

        const deleted = localUsers[index];
        localUsers.splice(index, 1);

        addAuditLog({
          type: 'ADMIN_ACTION',
          username: auth.sub,
          role: auth.role,
          action: 'Deleted user',
          details: { targetUser: deleted.username },
          status: 'success',
        });

        res.status(200).json({ message: 'User berhasil dihapus.' });
        return;
      }

      res.status(400).json({ message: 'Invalid action' });
      return;
    }

    res.status(405).json({ message: 'Method tidak diizinkan.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Gagal mengelola users.' });
  }
}
