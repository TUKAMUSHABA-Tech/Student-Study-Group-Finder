import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { 
  ShieldAlert, Users, BookOpen, Layers, Calendar, TrendingUp, 
  Trash2, RefreshCw, UserPlus, Search, X, CheckCircle2, AlertCircle
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [userSearch, setUserSearch] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    full_name: '',
    email: '',
    password: 'Password123!',
    programme: 'Bachelor of Science in Information Technology',
    year_of_study: '1',
    role: 'student'
  });

  const { notifications } = useNotifications();

  const loadAdminData = useCallback(async () => {
    try {
      const [statsRes, usersRes, groupsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/groups')
      ]);
      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (usersRes.data?.success && Array.isArray(usersRes.data.users)) {
        setUsers(usersRes.data.users);
      }
      if (groupsRes.data?.success && Array.isArray(groupsRes.data.groups)) {
        setGroups(groupsRes.data.groups);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { loadAdminData(); }, [loadAdminData]);

  // Real-time synchronization: poll every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadAdminData();
    }, 3000);
    return () => clearInterval(interval);
  }, [loadAdminData]);

  // Cross-tab and in-memory event listeners
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e.key || e.key.includes('ucu_gh_pages_store') || e.key.includes('ucu_notifications')) {
        loadAdminData();
      }
    };
    const handleCustomUpdate = () => {
      loadAdminData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ucu_store_updated', handleCustomUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ucu_store_updated', handleCustomUpdate);
    };
  }, [loadAdminData]);

  // Auto-refresh when notification count changes
  useEffect(() => {
    if (notifications.length > 0) loadAdminData();
  }, [notifications.length, loadAdminData]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setFeedback({ message: `✅ User role updated to "${newRole}"!`, type: 'success' });
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
      }
    } catch (err) {
      setFeedback({ message: err.response?.data?.message || 'Error updating role.', type: 'danger' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently? This cannot be undone.')) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        setFeedback({ message: '🗑️ User deleted.', type: 'success' });
        setUsers(users.filter(u => u.id !== userId));
        loadAdminData();
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
      }
    } catch (err) {
      setFeedback({ message: err.response?.data?.message || 'Error deleting user.', type: 'danger' });
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Delete this study group permanently?')) return;
    try {
      const res = await api.delete(`/groups/${groupId}`);
      if (res.data.success) {
        setFeedback({ message: '🗑️ Study group deleted.', type: 'success' });
        setGroups(groups.filter(g => g.id !== groupId));
        loadAdminData();
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
      }
    } catch (err) {
      setFeedback({ message: err.response?.data?.message || 'Error deleting group.', type: 'danger' });
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserForm.full_name || !newUserForm.email || !newUserForm.password) {
      alert('Please fill in student name, email, and password.');
      return;
    }

    setAddingUser(true);
    try {
      const res = await api.post('/admin/users', newUserForm);
      if (res.data?.success) {
        setFeedback({ message: `✅ Student "${newUserForm.full_name}" registered and added to directory successfully!`, type: 'success' });
        setShowAddUserModal(false);
        setNewUserForm({
          full_name: '',
          email: '',
          password: 'Password123!',
          programme: 'Bachelor of Science in Information Technology',
          year_of_study: '1',
          role: 'student'
        });
        loadAdminData();
        setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
      } else {
        alert(res.data?.message || 'Failed to create user.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating user account.');
    } finally {
      setAddingUser(false);
    }
  };

  // Filter users by search term
  const filteredUsers = users.filter(u => {
    if (!userSearch) return true;
    const term = userSearch.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.programme && u.programme.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term))
    );
  });

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading Administrator Dashboard...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626', marginBottom: '0.25rem' }}>
              <ShieldAlert size={20} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                System Administrator Control Center
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ucu-primary-dark)' }}>
              Platform Analytics & User Management
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Manage all registered university student accounts, assign leadership roles, and supervise campus study pods.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="btn btn-sm btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <UserPlus size={15} /> ➕ Register New Student
            </button>
            <button
              onClick={() => { setLoading(true); loadAdminData(); }}
              className="btn btn-sm btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} /> Refresh Data
            </button>
          </div>
        </div>
      </div>

      {feedback.message && (
        <div className={`alert alert-${feedback.type}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#EFF6FF', color: '#2563EB' }}><Users size={24} /></div>
          <div><div className="stat-value">{stats?.totalUsers || users.length}</div><div className="stat-label">Total Registered Students</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#ECFDF5', color: '#059669' }}><BookOpen size={24} /></div>
          <div><div className="stat-value">{stats?.totalGroups || groups.length}</div><div className="stat-label">Study Groups</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#FFFBEB', color: '#D97706' }}><Layers size={24} /></div>
          <div><div className="stat-value">{stats?.totalMemberships || 0}</div><div className="stat-label">Group Memberships</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#F3E8FF', color: '#9333EA' }}><Calendar size={24} /></div>
          <div><div className="stat-value">{stats?.totalSessions || 0}</div><div className="stat-label">Scheduled Sessions</div></div>
        </div>
      </div>

      {/* Modal / Card to Register New Student directly */}
      {showAddUserModal && (
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--ucu-primary)', background: '#F8FAFC' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ucu-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={18} color="var(--ucu-primary)" /> Register & Add New Student Directly
            </h3>
            <button
              onClick={() => setShowAddUserModal(false)}
              className="btn btn-sm btn-outline"
              style={{ padding: '0.2rem 0.5rem' }}
            >
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleAddUserSubmit} style={{ marginTop: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Samuel Mugisha"
                  value={newUserForm.full_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>University Email *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. samuel@ucu.ac.ug"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Password *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter initial password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Programme of Study</label>
                <select
                  className="form-control"
                  value={newUserForm.programme}
                  onChange={(e) => setNewUserForm({ ...newUserForm, programme: e.target.value })}
                >
                  <option value="Bachelor of Science in Information Technology">Bachelor of Science in Information Technology</option>
                  <option value="Bachelor of Science in Computer Science">Bachelor of Science in Computer Science</option>
                  <option value="Bachelor of Science in Data Science">Bachelor of Science in Data Science</option>
                  <option value="Bachelor of Business Administration">Bachelor of Business Administration</option>
                  <option value="Bachelor of Laws">Bachelor of Laws</option>
                  <option value="Bachelor of Nursing Science">Bachelor of Nursing Science</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Year of Study</label>
                <select
                  className="form-control"
                  value={newUserForm.year_of_study}
                  onChange={(e) => setNewUserForm({ ...newUserForm, year_of_study: e.target.value })}
                >
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Assigned Role</label>
                <select
                  className="form-control"
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                >
                  <option value="student">student (Standard member)</option>
                  <option value="leader">leader (Group creator / leader)</option>
                  <option value="admin">admin (Platform moderator)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="btn btn-outline"
                style={{ background: '#FFFFFF' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={addingUser}
              >
                {addingUser ? 'Registering...' : 'Save & Register Student'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============ ALL REGISTERED USERS DIRECTORY ============ */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--ucu-primary)" /> All Registered Users ({filteredUsers.length}{filteredUsers.length !== users.length ? ` of ${users.length}` : ''})
            </h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              🔄 Real-time synchronized directory of all university members
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search user by name, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{ paddingLeft: '30px', fontSize: '0.85rem', height: '34px' }}
              />
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="btn btn-sm btn-accent"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', height: '34px' }}
            >
              <UserPlus size={14} /> Add User
            </button>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p style={{ fontWeight: 600 }}>No users found matching your search.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Click <strong>"Add User"</strong> above to register a student directly into the platform!
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Account</th>
                  <th className="hide-mobile">University Email</th>
                  <th className="hide-mobile">Degree Programme</th>
                  <th className="hide-mobile">Year</th>
                  <th>System Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                          background: u.role === 'admin' ? '#FEF2F2' : u.role === 'leader' ? '#F3E8FF' : '#EFF6FF',
                          color: u.role === 'admin' ? '#DC2626' : u.role === 'leader' ? '#9333EA' : '#2563EB',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem'
                        }}>
                          {u.full_name ? u.full_name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ucu-primary-dark)' }}>{u.full_name}</div>
                          <div className="show-mobile-only" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          <div className="show-mobile-only" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.programme || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile" style={{ fontSize: '0.85rem' }}>{u.email}</td>
                    <td className="hide-mobile" style={{ fontSize: '0.85rem' }}>{u.programme || '-'}</td>
                    <td className="hide-mobile">Year {u.year_of_study || 1}</td>
                    <td>
                      <select
                        className="form-control"
                        style={{ padding: '0.25rem 0.45rem', fontSize: '0.8rem', width: 'auto', minWidth: '85px' }}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="student">student</option>
                        <option value="leader">leader</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>
                      {u.role !== 'admin' ? (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="btn btn-sm btn-outline"
                          style={{ color: 'var(--danger)', padding: '0.2rem 0.5rem' }}
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, background: '#F1F5F9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                          Primary Admin
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============ STUDY GROUPS MODERATION TABLE ============ */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="var(--ucu-primary)" /> Campus Study Groups ({groups.length})
          </h2>
        </div>
        {groups.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <BookOpen size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p>No study groups created yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Course Code</th>
                  <th className="hide-mobile">Faculty</th>
                  <th className="hide-mobile">Group Leader</th>
                  <th className="hide-mobile">Enrolled</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.id}>
                    <td style={{ fontWeight: 600 }}>{g.name}</td>
                    <td><span className="badge badge-course">{g.course_code}</span></td>
                    <td className="hide-mobile" style={{ fontSize: '0.85rem' }}>{g.faculty}</td>
                    <td className="hide-mobile">{g.leader_name}</td>
                    <td className="hide-mobile">{g.member_count} members</td>
                    <td>
                      <button
                        onClick={() => handleDeleteGroup(g.id)}
                        className="btn btn-sm btn-outline"
                        style={{ color: 'var(--danger)', padding: '0.2rem 0.5rem' }}
                        title="Delete Group"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
