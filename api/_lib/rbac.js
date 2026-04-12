/**
 * Role-based Access Control (RBAC) untuk PBO Waron Hospital
 */

const ROLES = {
  admin: {
    name: 'Administrator',
    permissions: [
      'view_basic_calc',
      'advanced_calc',
      'export_data',
      'manage_users',
      'view_audit_logs',
      'manage_master_data',
      'system_settings',
    ],
  },
  finance: {
    name: 'Finance Officer',
    permissions: [
      'view_basic_calc',
      'advanced_calc',
      'export_data',
      'view_audit_logs',
    ],
  },
  doctor: {
    name: 'Doctor / DPJP',
    permissions: [
      'view_basic_calc',
      'advanced_calc',
      'export_data',
    ],
  },
  staff: {
    name: 'Staff PBO',
    permissions: [
      'view_basic_calc',
      'advanced_calc',
    ],
  },
  viewer: {
    name: 'Viewer Only',
    permissions: [
      'view_basic_calc',
    ],
  },
};

export function getRole(roleName) {
  return ROLES[roleName] || ROLES.viewer;
}

export function hasPermission(userRole, permission) {
  const role = getRole(userRole);
  return role.permissions.includes(permission);
}

export function checkPermission(userRole, requiredPermission, res) {
  if (!hasPermission(userRole, requiredPermission)) {
    res.status(403).json({
      message: `Akses ditolak. Permission '${requiredPermission}' diperlukan.`,
    });
    return false;
  }
  return true;
}

export function getAllRoles() {
  return Object.entries(ROLES).map(([key, value]) => ({
    id: key,
    ...value,
  }));
}
