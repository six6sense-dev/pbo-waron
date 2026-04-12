import { useState, useCallback } from 'react';
import { ChevronDown, LogOut, Users, BarChart3, Zap, Eye, AlertCircle, Plus, Edit2, X, RefreshCw, Printer, Download } from 'lucide-react';
import './App.css';

export default function App() {
  const [state, setState] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('calculator');
  const [bootstrap, setBootstrap] = useState(null);
  
  // Calculator states
  const [calcForm, setCalcForm] = useState({ procedure: '', class: '', doctor: '' });
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  
  // Audit states
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditStats, setAuditStats] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilters, setAuditFilters] = useState({ action: '', user: '', days: 30 });
  
  // Users management
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', password: '', name: '', role: 'staff' });
  const [editingUser, setEditingUser] = useState(null);
  
  // Profile states
  const [profileForm, setProfileForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const formatRupiah = useCallback((value) => {
    const number = Number(value || 0);
    return `Rp ${number.toLocaleString('id-ID')}`;
  }, []);

  // API Functions
  const apiCall = useCallback(async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    
    const url = `/api${endpoint}`;
    const response = await fetch(url, { ...options, headers });
    
    // Read body once (can't read twice)
    const bodyText = await response.text();
    
    let data;
    try {
      data = bodyText ? JSON.parse(bodyText) : {};
    } catch (e) {
      throw new Error(`Invalid JSON response: ${bodyText || '(empty response)'}`);
    }
    
    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }
    return data;
  }, [token]);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await apiCall('/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      });
      
      setToken(response.token);
      setUser(response.user);
      
      // Load bootstrap data
      const bootstrapData = await apiCall('/bootstrap', {
        headers: {
          Authorization: `Bearer ${response.token}`,
        },
      });
      setBootstrap(bootstrapData);
      setState('dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [loginForm, apiCall]);

  const handleLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    setBootstrap(null);
    setState('login');
    setLoginForm({ username: '', password: '' });
    setError('');
  }, []);

  const handleCalculate = useCallback(async (e) => {
    e.preventDefault();
    setCalcLoading(true);
    setError('');
    
    try {
      const response = await apiCall('/calculate', {
        method: 'POST',
        body: JSON.stringify({
          procedureId: calcForm.procedure,
          className: calcForm.class,
          doctorMultiplier: calcForm.doctor === 'specialist' ? 1.3 : calcForm.doctor === 'consultant' ? 1.5 : 1,
        }),
      });
      
      setCalcResult(response);
    } catch (err) {
      setError(err.message || 'Calculation failed');
    } finally {
      setCalcLoading(false);
    }
  }, [calcForm, apiCall]);

  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const params = new URLSearchParams({
        page: auditPage,
        pageSize: 20,
        ...(auditFilters.action && { action: auditFilters.action }),
        ...(auditFilters.user && { user: auditFilters.user }),
        ...(auditFilters.days && { days: auditFilters.days }),
      });
      
      const response = await apiCall(`/audit?${params}`);
      setAuditLogs(response.logs);
      setAuditStats(response.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setAuditLoading(false);
    }
  }, [auditPage, auditFilters, apiCall]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response = await apiCall('/users');
      setUsersList(response.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }, [apiCall]);

  const handleSaveUser = useCallback(async (e) => {
    e.preventDefault();
    setUsersLoading(true);
    try {
      if (editingUser) {
        await apiCall(`/users?id=${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(userForm),
        });
      } else {
        await apiCall('/users', {
          method: 'POST',
          body: JSON.stringify(userForm),
        });
      }
      setUserForm({ username: '', password: '', name: '', role: 'staff' });
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }, [userForm, editingUser, apiCall, loadUsers]);

  const handleDeleteUser = useCallback(async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    
    setUsersLoading(true);
    try {
      await apiCall(`/users?id=${userId}`, { method: 'DELETE' });
      loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }, [apiCall, loadUsers]);

  const handleUpdateProfile = useCallback(async (e) => {
    e.preventDefault();
    
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setProfileLoading(true);
    try {
      await apiCall('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword,
        }),
      });
      setProfileForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
      alert('Password updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setProfileLoading(false);
    }
  }, [profileForm, apiCall]);

  const hasPermission = useCallback((permission) => {
    return user?.permissions?.includes(permission) || false;
  }, [user]);

  const getSelectedProcedure = useCallback(() => {
    if (!calcResult?.procedure) return null;
    return calcResult.procedure;
  }, [calcResult]);

  const handlePrintA4 = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadA4 = useCallback(() => {
    if (!calcResult?.breakdown || !calcResult?.procedure) return;

    const p = calcResult.procedure;
    const b = calcResult.breakdown;
    const reportHtml = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PBO Report - ${p.name}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    body { font-family: Arial, sans-serif; color: #1f2937; margin: 0; }
    .page { width: 210mm; min-height: 297mm; padding: 14mm; box-sizing: border-box; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1b66d6; padding-bottom: 10px; }
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo img { width: 34px; height: 34px; }
    .hospital { font-size: 20px; font-weight: 800; color: #1b66d6; }
    .subtitle { color: #4b5563; margin-top: 2px; font-size: 13px; }
    h1 { margin: 14px 0 4px; font-size: 20px; }
    .meta { display: grid; grid-template-columns: 170px 1fr; gap: 6px 10px; margin: 10px 0 14px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; }
    th { background: #eff6ff; text-align: left; }
    .total { margin-top: 14px; padding: 12px; background: #ecfeff; border: 1px solid #a5f3fc; border-radius: 8px; }
    .total strong { font-size: 18px; color: #0f172a; }
    .note { margin-top: 18px; font-size: 11px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">
        <img src="${window.location.origin}/favicon.svg" alt="Waron Hospital Logo" />
        <div>
          <div class="hospital">Waron Hospital</div>
          <div class="subtitle">Patient Billing Optimization Report</div>
        </div>
      </div>
      <div>${new Date().toLocaleString('id-ID')}</div>
    </div>

    <h1>Laporan Perkiraan Biaya Operasi (PBO)</h1>
    <div class="meta">
      <div><strong>Tindakan</strong></div><div>${p.name}</div>
      <div><strong>Kategori</strong></div><div>${p.category || '-'}</div>
      <div><strong>Golongan</strong></div><div>${p.gol || '-'}</div>
      <div><strong>Kelas Pasien</strong></div><div>${calcResult.className || '-'}</div>
      <div><strong>Multiplier Dokter</strong></div><div>${calcResult.doctorMultiplier || 1}x</div>
      <div><strong>Lama Rawat</strong></div><div>${calcResult.days || 0} hari</div>
    </div>

    <table>
      <thead><tr><th>Komponen Biaya</th><th>Nominal</th></tr></thead>
      <tbody>
        <tr><td>Jasa Operator / Dasar Tindakan</td><td>${formatRupiah(b.operator)}</td></tr>
        <tr><td>Sewa Alat</td><td>${formatRupiah(b.alat)}</td></tr>
        <tr><td>BMHP / Farmasi</td><td>${formatRupiah(b.obat)}</td></tr>
        <tr><td>Tarif Kamar</td><td>${formatRupiah(b.kamar)}</td></tr>
        <tr><td>Visite</td><td>${formatRupiah(b.visite)}</td></tr>
        <tr><td>Administrasi</td><td>${formatRupiah(b.admin)}</td></tr>
        <tr><td>Add-ons</td><td>${formatRupiah(b.addons)}</td></tr>
        <tr><td>Subtotal</td><td>${formatRupiah(b.subtotal)}</td></tr>
        <tr><td>Setelah Multiplier</td><td>${formatRupiah(b.afterMultiplier)}</td></tr>
      </tbody>
    </table>

    <div class="total">
      <div>Total Estimasi PBO</div>
      <strong>${formatRupiah(b.total)}</strong>
    </div>

    <div class="note">Dokumen ini adalah estimasi biaya berdasarkan data tarif PBO Waron Hospital dan dapat berubah sesuai kondisi klinis pasien.</div>
  </div>
</body>
</html>`;

    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PBO-${p.name.replace(/[^a-z0-9]+/gi, '-')}-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [calcResult, formatRupiah]);

  // LOGIN SCREEN
  if (state === 'login') {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="brand-line">
            <Zap size={24} />
            Waron Hospital
          </div>
          <h1>PBO System</h1>
          <p>Patient Billing Optimization</p>
          
          <form className="auth-form" onSubmit={handleLogin}>
            {error && <div className="error-box"><AlertCircle size={16} />{error}</div>}
            
            <label>
              Username
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="Enter username"
                required
              />
            </label>
            
            <label>
              Password
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="Enter password"
                required
              />
            </label>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p className="muted">Demo: admin / admin123</p>
        </div>
      </div>
    );
  }

  // DASHBOARD
  if (!user || !bootstrap) {
    return <div className="dashboard-shell"><p>Loading...</p></div>;
  }

  const showFinanceTabs = user.role === 'admin' || user.role === 'finance';
  const canViewAudit = hasPermission('view_audit');
  const canManageUsers = hasPermission('manage_users');

  return (
    <div className="dashboard-shell">
      {/* TOP BAR */}
      <div className="topbar">
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>PBO Dashboard</h1>
          <p style={{ color: 'var(--ink-500)', fontSize: '0.9rem' }}>
            {user.name || user.username} • {user.role}
          </p>
        </div>
        <div className="user-panel">
          <button className="ghost" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* METRICS */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Procedures</h3>
          <strong>{bootstrap.procedures?.length || 0}</strong>
        </div>
        <div className="metric-card">
          <h3>Classes</h3>
          <strong>{bootstrap.classes?.length || 0}</strong>
        </div>
        <div className="metric-card">
          <h3>Users</h3>
          <strong>{bootstrap.userCount || 1}</strong>
        </div>
        <div className="metric-card">
          <h3>Your Role</h3>
          <strong>{user.role}</strong>
        </div>
      </div>

      {error && <div style={{ margin: '1rem 0' }} className="error-box"><AlertCircle size={16} />{error}</div>}

      {/* TABS */}
      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          <Zap size={18} /> Calculator
        </button>
        
        {showFinanceTabs && (
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <BarChart3 size={18} /> Reports
          </button>
        )}
        
        {canViewAudit && (
          <button
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => { setActiveTab('audit'); loadAuditLogs(); }}
          >
            <Eye size={18} /> Audit
          </button>
        )}
        
        {canManageUsers && (
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => { setActiveTab('users'); loadUsers(); }}
          >
            <Users size={18} /> Users
          </button>
        )}
        
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <ChevronDown size={18} /> Profile
        </button>
      </div>

      {/* CALCULATOR TAB */}
      {activeTab === 'calculator' && (
        <div className="main-grid">
          <div className="panel">
            <div className="panel-head">
              <h2>PBO Calculation</h2>
            </div>
            
            <form className="calc-form" onSubmit={handleCalculate}>
              <label>
                Procedure
                <select
                  value={calcForm.procedure}
                  onChange={(e) => setCalcForm({ ...calcForm, procedure: e.target.value })}
                  required
                >
                  <option value="">Select procedure...</option>
                  {bootstrap.procedures?.map((p) => (
                    <option key={p.id || p.name} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>
              
              <label>
                Patient Class
                <select
                  value={calcForm.class}
                  onChange={(e) => setCalcForm({ ...calcForm, class: e.target.value })}
                  required
                >
                  <option value="">Select class...</option>
                  {bootstrap.classes?.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              
              <label>
                Doctor Multiplier
                <select
                  value={calcForm.doctor}
                  onChange={(e) => setCalcForm({ ...calcForm, doctor: e.target.value })}
                >
                  <option value="standard">Standard (1x)</option>
                  <option value="specialist">Specialist (1.3x)</option>
                  <option value="consultant">Consultant (1.5x)</option>
                </select>
              </label>
              
              <button type="submit" disabled={calcLoading}>
                {calcLoading ? 'Calculating...' : 'Calculate'}
              </button>
            </form>
          </div>
          
          {calcResult && (
            <div className="panel">
              <div className="panel-head">
                <h2>Result</h2>
              </div>
              <div className="result-box">
                <p><strong>Procedure:</strong> {getSelectedProcedure()?.name}</p>
                <p><strong>Class:</strong> {calcResult.className}</p>
                <p><strong>Doctor Multiplier:</strong> {calcResult.doctorMultiplier}x</p>
                <hr />
                <p className="total-line">
                  Total: {formatRupiah(calcResult.breakdown?.total || 0)}
                </p>
                <p className="muted">Calculated at {new Date(calcResult.calculatedAt).toLocaleString('id-ID')}</p>
              </div>

              <div className="print-actions">
                <button type="button" className="secondary" onClick={handleDownloadA4}>
                  <Download size={16} /> Unduh A4
                </button>
                <button type="button" onClick={handlePrintA4}>
                  <Printer size={16} /> Print A4
                </button>
              </div>

              <div className="pbo-a4-report" id="pbo-a4-report">
                <div className="pbo-a4-header">
                  <div className="pbo-a4-logo-wrap">
                    <img src="/favicon.svg" alt="Waron Hospital Logo" className="pbo-a4-logo" />
                    <div>
                      <h3>Waron Hospital</h3>
                      <p>Patient Billing Optimization</p>
                    </div>
                  </div>
                  <div className="pbo-a4-date">{new Date(calcResult.calculatedAt).toLocaleString('id-ID')}</div>
                </div>

                <h4 className="pbo-a4-title">Laporan Perkiraan Biaya Operasi (PBO)</h4>
                <div className="pbo-a4-meta">
                  <span>Tindakan: <strong>{getSelectedProcedure()?.name}</strong></span>
                  <span>Golongan: <strong>{getSelectedProcedure()?.gol || '-'}</strong></span>
                  <span>Kelas: <strong>{calcResult.className}</strong></span>
                  <span>Lama Rawat: <strong>{calcResult.days} hari</strong></span>
                </div>

                <table className="pbo-a4-table">
                  <thead>
                    <tr>
                      <th>Komponen</th>
                      <th>Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Jasa Operator / Dasar Tindakan</td><td>{formatRupiah(calcResult.breakdown?.operator)}</td></tr>
                    <tr><td>Sewa Alat</td><td>{formatRupiah(calcResult.breakdown?.alat)}</td></tr>
                    <tr><td>BMHP / Farmasi</td><td>{formatRupiah(calcResult.breakdown?.obat)}</td></tr>
                    <tr><td>Tarif Kamar</td><td>{formatRupiah(calcResult.breakdown?.kamar)}</td></tr>
                    <tr><td>Visite</td><td>{formatRupiah(calcResult.breakdown?.visite)}</td></tr>
                    <tr><td>Administrasi</td><td>{formatRupiah(calcResult.breakdown?.admin)}</td></tr>
                    <tr><td>Subtotal</td><td>{formatRupiah(calcResult.breakdown?.subtotal)}</td></tr>
                  </tbody>
                </table>

                <div className="pbo-a4-total">
                  <span>Total Estimasi PBO</span>
                  <strong>{formatRupiah(calcResult.breakdown?.total)}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="panel">
          <div className="panel-head">
            <h2>Financial Reports</h2>
          </div>
          <p>Coming soon...</p>
        </div>
      )}

      {/* AUDIT TAB */}
      {activeTab === 'audit' && canViewAudit && (
        <div className="panel">
          <div className="panel-head">
            <h2>Audit Logs</h2>
            <button className="ghost" onClick={loadAuditLogs} disabled={auditLoading}>
              <RefreshCw size={16} />
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', marginBottom: '1rem' }}>
            <label>
              Action
              <select
                value={auditFilters.action}
                onChange={(e) => { setAuditFilters({ ...auditFilters, action: e.target.value }); setAuditPage(1); }}
              >
                <option value="">All actions</option>
                <option value="login">Login</option>
                <option value="calculate">Calculate</option>
                <option value="create_user">Create User</option>
                <option value="delete_user">Delete User</option>
              </select>
            </label>
            
            <label>
              Days
              <select
                value={auditFilters.days}
                onChange={(e) => { setAuditFilters({ ...auditFilters, days: parseInt(e.target.value) }); setAuditPage(1); }}
              >
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="0">All time</option>
              </select>
            </label>
          </div>
          
          {auditStats && (
            <div className="stats-grid">
              <div className="stat-box">
                <strong>{auditStats.totalLogins}</strong>
                <p>Total Logins</p>
              </div>
              <div className="stat-box">
                <strong>{auditStats.totalCalculations}</strong>
                <p>Calculations</p>
              </div>
              <div className="stat-box">
                <strong>{auditStats.activeUsers}</strong>
                <p>Active Users</p>
              </div>
              <div className="stat-box">
                <strong>{auditStats.totalEvents}</strong>
                <p>Total Events</p>
              </div>
            </div>
          )}
          
          <div className="table-container">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="mono">{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.user}</td>
                    <td>{log.action}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--ink-500)' }}>
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button className="secondary" onClick={() => setAuditPage(Math.max(1, auditPage - 1))} disabled={auditPage === 1}>
              Previous
            </button>
            <span style={{ alignSelf: 'center', color: 'var(--ink-500)' }}>Page {auditPage}</span>
            <button className="secondary" onClick={() => setAuditPage(auditPage + 1)} disabled={auditLogs.length < 20}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && canManageUsers && (
        <div>
          <div className="main-grid">
            <div className="panel">
              <div className="panel-head">
                <h2>{editingUser ? 'Edit User' : 'New User'}</h2>
              </div>
              
              <form className="calc-form" onSubmit={handleSaveUser}>
                <label>
                  Username
                  <input
                    type="text"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    placeholder="Username"
                    required
                    disabled={!!editingUser}
                  />
                </label>
                
                <label>
                  Password
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="Password"
                    required={!editingUser}
                  />
                </label>
                
                <label>
                  Full Name
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="Full name"
                    required
                  />
                </label>
                
                <label>
                  Role
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="admin">Admin</option>
                    <option value="finance">Finance</option>
                    <option value="doctor">Doctor</option>
                    <option value="staff">Staff</option>
                  </select>
                </label>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" disabled={usersLoading}>{editingUser ? 'Update' : 'Create'}</button>
                  {editingUser && (
                    <button type="button" className="secondary" onClick={() => { setEditingUser(null); setUserForm({ username: '', password: '', name: '', role: 'staff' }); }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            <div className="panel">
              <div className="panel-head">
                <h2>Users</h2>
              </div>
              
              <div className="table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id}>
                        <td>{u.username}</td>
                        <td>{u.name}</td>
                        <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                        <td>
                          <button className="ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }} onClick={() => { setEditingUser(u); setUserForm({ ...u, password: '' }); }}>
                            <Edit2 size={14} />
                          </button>
                          <button className="ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', color: 'var(--danger)' }} onClick={() => handleDeleteUser(u.id)}>
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="main-grid">
          <div className="panel">
            <div className="panel-head">
              <h2>Profile Settings</h2>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Role:</strong> <span className={`role-badge role-${user.role}`}>{user.role}</span></p>
            </div>
            
            <hr />
            
            <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Change Password</h3>
            <form className="calc-form" onSubmit={handleUpdateProfile}>
              <label>
                Current Password
                <input
                  type="password"
                  value={profileForm.currentPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                  placeholder="Current password"
                  required
                />
              </label>
              
              <label>
                New Password
                <input
                  type="password"
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                  placeholder="New password"
                  required
                />
              </label>
              
              <label>
                Confirm Password
                <input
                  type="password"
                  value={profileForm.confirmPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  required
                />
              </label>
              
              <button type="submit" disabled={profileLoading}>
                {profileLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
          
          <div className="panel">
            <div className="panel-head">
              <h2>Permissions</h2>
            </div>
            
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {user.permissions?.map((perm) => (
                <div key={perm} style={{ padding: '0.6rem', background: '#f8fbff', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--ink-700)' }}>
                  ✓ {perm.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
