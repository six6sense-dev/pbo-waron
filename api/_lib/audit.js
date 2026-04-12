/**
 * Audit Log System untuk PBO Waron Hospital
 * Mencatat semua aksi login, perhitungan, dan modifikasi data
 */

let auditLogs = [];
const MAX_LOGS = 5000;

export function addAuditLog(event) {
  const log = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type: event.type, // 'LOGIN', 'CALCULATE', 'VIEW', 'EXPORT', 'ADMIN_ACTION'
    username: event.username || 'unknown',
    role: event.role || 'guest',
    action: event.action,
    details: event.details || {},
    ip: event.ip || 'unknown',
    status: event.status || 'success', // 'success', 'error', 'blocked'
  };

  auditLogs.unshift(log);
  if (auditLogs.length > MAX_LOGS) {
    auditLogs = auditLogs.slice(0, MAX_LOGS);
  }

  return log;
}

export function getAuditLogs(filter = {}) {
  let results = [...auditLogs];

  if (filter.username) {
    results = results.filter((log) => log.username === filter.username);
  }

  if (filter.type) {
    results = results.filter((log) => log.type === filter.type);
  }

  if (filter.role) {
    results = results.filter((log) => log.role === filter.role);
  }

  if (filter.status) {
    results = results.filter((log) => log.status === filter.status);
  }

  if (filter.startDate) {
    const start = new Date(filter.startDate).getTime();
    results = results.filter((log) => new Date(log.timestamp).getTime() >= start);
  }

  if (filter.endDate) {
    const end = new Date(filter.endDate).getTime();
    results = results.filter((log) => new Date(log.timestamp).getTime() <= end);
  }

  const limit = filter.limit || 100;
  const offset = filter.offset || 0;

  return {
    total: results.length,
    logs: results.slice(offset, offset + limit),
    offset,
    limit,
  };
}

export function getAuditStats() {
  const stats = {
    totalEvents: auditLogs.length,
    byType: {},
    byRole: {},
    byStatus: {},
    recentActivity: auditLogs.slice(0, 10),
  };

  auditLogs.forEach((log) => {
    stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
    stats.byRole[log.role] = (stats.byRole[log.role] || 0) + 1;
    stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
  });

  return stats;
}

export function clearAuditLogs() {
  auditLogs = [];
}
