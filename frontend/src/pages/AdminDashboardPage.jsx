import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  ShieldAlert, 
  Users, 
  BookOpen, 
  Layers, 
  Calendar, 
  TrendingUp, 
  Trash2, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const loadAdminData = async () => {
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
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setFeedback({ message: 'User role updated successfully!', type: 'success' });
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      setFeedback({ message: err.response?.data?.message || 'Error updating role.', type: 'danger' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user from the platform?')) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        setFeedback({ message: 'User deleted from platform.', type: 'success' });
        setUsers(users.filter(u => u.id !== userId));
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
        setFeedback({ message: 'Study group deleted.', type: 'success' });
        setGroups(groups.filter(g => g.id !== groupId));
      }
    } catch (err) {
      setFeedback({ message: err.response?.data?.message || 'Error deleting group.', type: 'danger' });
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading Administrator Analytics...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626', marginBottom: '0.25rem' }}>
          <ShieldAlert size={20} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            System Administrator Control Center
          </span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--ucu-primary-dark)' }}>
          University Platform Analytics & Moderation
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Monitor platform adoption, active course clusters, and manage registered student accounts and study groups.
        </p>
      </div>

      {feedback.message && (
        <div className={`alert alert-${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.totalUsers || users.length}</div>
            <div className="stat-label">Total Registered Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#ECFDF5', color: '#059669' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.totalGroups || groups.length}</div>
            <div className="stat-label">Total Study Groups</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#FFFBEB', color: '#D97706' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.totalMemberships || 0}</div>
            <div className="stat-label">Total Pod Memberships</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#F3E8FF', color: '#9333EA' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.totalSessions || 0}</div>
            <div className="stat-label">Scheduled Sessions</div>
          </div>
        </div>
      </div>

      {/* Most Active Courses Analysis */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--ucu-primary)" /> Most Active Courses & Engagement
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {(stats?.activeCourses || []).map((c, idx) => (
            <div key={idx} style={{ padding: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span className="badge badge-course" style={{ fontSize: '0.9rem' }}>{c.course_code}</span>
              <div style={{ marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ucu-primary-dark)' }}>
                {c.group_count} {c.group_count === 1 ? 'Study Group' : 'Study Groups'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                High peer participation
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users Management Table */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="var(--ucu-primary)" /> Student Accounts Directory ({users.length})
          </h2>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Programme</th>
                <th>Year</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td style={{ fontSize: '0.85rem' }}>{u.programme}</td>
                  <td>Year {u.year_of_study}</td>
                  <td>
                    <select
                      className="form-control"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', width: 'auto' }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="student">student</option>
                      <option value="leader">leader</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="btn btn-sm btn-outline"
                      style={{ color: 'var(--danger)', padding: '0.2rem 0.5rem' }}
                      title="Delete User"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Study Groups Moderation Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="var(--ucu-primary)" /> Campus Study Groups Moderation ({groups.length})
          </h2>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Course</th>
                <th>Faculty</th>
                <th>Leader</th>
                <th>Enrolled</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 600 }}>{g.name}</td>
                  <td><span className="badge badge-course">{g.course_code}</span></td>
                  <td style={{ fontSize: '0.85rem' }}>{g.faculty}</td>
                  <td>{g.leader_name}</td>
                  <td>{g.member_count} members</td>
                  <td>
                    <button
                      onClick={() => handleDeleteGroup(g.id)}
                      className="btn btn-sm btn-outline"
                      style={{ color: 'var(--danger)', padding: '0.2rem 0.5rem' }}
                      title="Delete Study Group"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
