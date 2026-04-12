import { useState, useCallback } from 'react';
import { ChevronDown, LogOut, Users, BarChart3, Zap, Eye, AlertCircle, Plus, Edit2, X, RefreshCw } from 'lucide-react';
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

  // API Functions
  const apiCall = useCallback(async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    
    const url = `/api${endpoint}`;
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
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
      const bootstrapData = await apiCall('/bootstrap');
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
          procedure: calcForm.procedure,
          class: calcForm.class,
          doctor: calcForm.doctor || 'standard',
        }),
      });
      
      setCalcResult(response.result);
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
                    <option key={p.name} value={p.name}>{p.name}</option>
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
                  <option value="senior">Senior (1.2x)</option>
                  <option value="specialist">Specialist (1.5x)</option>
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
                <p><strong>Procedure:</strong> {calcResult.procedure}</p>
                <p><strong>Class Multiplier:</strong> {calcResult.classMultiplier}x</p>
                <p><strong>Doctor Multiplier:</strong> {calcResult.doctorMultiplier}x</p>
                <hr />
                <p className="total-line">
                  Total: Rp {calcResult.total?.toLocaleString('id-ID') || 0}
                </p>
                <p className="muted">Calculated at {new Date(calcResult.timestamp).toLocaleString()}</p>
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
