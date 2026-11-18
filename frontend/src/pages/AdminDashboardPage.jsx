import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { 
  ShieldAlert, Users, BookOpen, Layers, Calendar, TrendingUp, 
  Trash2, RefreshCw
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const { notifications } = useNotifications();

  const loadAdminData = useCallback(async () => {
    try {
      const [statsRes, usersRes, groupsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/groups')
      ]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (groupsRes.data.success) setGroups(groupsRes.data.groups);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAdminData(); }, [loadAdminData]);

  // Poll every 5 seconds for new registrations — catches users registered from any tab/device
  useEffect(() => {
    const interval = setInterval(() => {
      loadAdminData();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadAdminData]);

  // Also refresh immediately whenever a notification fires (instant feedback)
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
                System Administrator
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ucu-primary-dark)' }}>
              Platform Analytics & User Management
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              All registered users appear here automatically. Manage accounts, roles, and moderate study groups.
            </p>
          </div>
          <button onClick={() => { setLoading(true); loadAdminData(); }} className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {feedback.message && <div className={`alert alert-${feedback.type}`}>{feedback.message}</div>}

      {/* Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#EFF6FF', color: '#2563EB' }}><Users size={24} /></div>
          <div><div className="stat-value">{stats?.totalUsers || users.length}</div><div className="stat-label">Total Users</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#ECFDF5', color: '#059669' }}><BookOpen size={24} /></div>
          <div><div className="stat-value">{stats?.totalGroups || groups.length}</div><div className="stat-label">Study Groups</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#FFFBEB', color: '#D97706' }}><Layers size={24} /></div>
          <div><div className="stat-value">{stats?.totalMemberships || 0}</div><div className="stat-label">Memberships</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#F3E8FF', color: '#9333EA' }}><Calendar size={24} /></div>
          <div><div className="stat-value">{stats?.totalSessions || 0}</div><div className="stat-label">Sessions</div></div>
        </div>
      </div>

      {/* Active Courses */}
      {(stats?.activeCourses || []).length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--ucu-primary)" /> Active Courses
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            {stats.activeCourses.map((c, i) => (
              <div key={i} style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span className="badge badge-course">{c.course_code}</span>
                <div style={{ marginTop: '0.4rem', fontSize: '1.15rem', fontWeight: 700, color: 'var(--ucu-primary-dark)' }}>
                  {c.group_count} {c.group_count === 1 ? 'Group' : 'Groups'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ ALL REGISTERED USERS ============ */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="var(--ucu-primary)" /> All Registered Users ({users.length})
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#EFF6FF', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
            🔄 Auto-refreshes on new registrations
          </span>
        </div>

        {users.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p>No users registered yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th className="hide-mobile">Email</th>
                  <th className="hide-mobile">Programme</th>
                  <th className="hide-mobile">Year</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                          background: u.role === 'admin' ? '#FEF2F2' : u.role === 'leader' ? '#F3E8FF' : '#EFF6FF',
                          color: u.role === 'admin' ? '#DC2626' : u.role === 'leader' ? '#9333EA' : '#2563EB',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem'
                        }}>
                          {u.full_name ? u.full_name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{u.full_name}</div>
                          <div className="show-mobile-only" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          <div className="show-mobile-only" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.programme || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile" style={{ fontSize: '0.85rem' }}>{u.email}</td>
                    <td className="hide-mobile" style={{ fontSize: '0.85rem' }}>{u.programme || '-'}</td>
                    <td className="hide-mobile">Yr {u.year_of_study || 1}</td>
                    <td>
                      <select className="form-control" style={{ padding: '0.2rem 0.35rem', fontSize: '0.78rem', width: 'auto', minWidth: '78px' }} value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                        <option value="student">student</option>
                        <option value="leader">leader</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>
                      {u.role !== 'admin' ? (
                        <button onClick={() => handleDeleteUser(u.id)} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)', padding: '0.2rem 0.4rem' }} title="Delete User">
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============ STUDY GROUPS ============ */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="var(--ucu-primary)" /> Study Groups ({groups.length})
          </h2>
        </div>
        {groups.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <BookOpen size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p>No study groups created yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Course</th>
                  <th className="hide-mobile">Faculty</th>
                  <th className="hide-mobile">Leader</th>
                  <th className="hide-mobile">Members</th>
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
                    <td className="hide-mobile">{g.member_count}</td>
                    <td>
                      <button onClick={() => handleDeleteGroup(g.id)} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)', padding: '0.2rem 0.4rem' }} title="Delete Group">
                        <Trash2 size={14} />
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
