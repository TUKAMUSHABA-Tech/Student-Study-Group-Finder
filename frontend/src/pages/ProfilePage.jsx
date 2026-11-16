import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, GraduationCap, Calendar, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    programme: user?.programme || '',
    year_of_study: user?.year_of_study || 1
  });

  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ message: '', type: '' });
    setLoading(true);

    try {
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        updateUser(res.data.user);
        setFeedback({ message: 'Profile details updated successfully!', type: 'success' });
      }
    } catch (err) {
      setFeedback({ message: err.response?.data?.message || 'Error updating profile.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'var(--ucu-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 800,
            border: '3px solid var(--ucu-accent)'
          }}>
            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
          </div>

          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ucu-primary-dark)' }}>
              {user?.full_name}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {user?.email}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              <span className={`badge badge-${user?.role}`}>
                Role: {user?.role}
              </span>
              <span className="badge badge-course">
                Year {user?.year_of_study} Student
              </span>
            </div>
          </div>
        </div>

        {feedback.message && (
          <div className={`alert alert-${feedback.type}`} style={{ marginTop: '1.25rem' }}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', color: 'var(--ucu-primary-dark)', marginBottom: '1rem', fontWeight: 700 }}>
            Update Student Profile Information
          </h2>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">University Email Address (Read-only)</label>
            <input
              type="email"
              className="form-control"
              value={user?.email || ''}
              disabled
              style={{ background: '#F1F5F9', color: '#64748B' }}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              University institutional email is permanently bound to your academic record.
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Programme of Study</label>
              <input
                type="text"
                className="form-control"
                value={formData.programme}
                onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Year of Study</label>
              <select
                className="form-control"
                value={formData.year_of_study}
                onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
              >
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
