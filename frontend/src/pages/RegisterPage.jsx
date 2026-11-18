import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { broadcastNotification } from '../context/NotificationContext';
import { GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    programme: 'Bachelor of Science in Information Technology',
    year_of_study: '1'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const programmes = [
    'Bachelor of Science in Information Technology',
    'Bachelor of Science in Computer Science',
    'Bachelor of Science in Data Science',
    'Bachelor of Business Administration',
    'Bachelor of Laws',
    'Bachelor of Education',
    'Bachelor of Nursing Science',
    'Bachelor of Social Work and Social Administration'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.full_name || !formData.email || !formData.password) {
      setError('Please fill in all required registration fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        broadcastNotification(
          'user_registered',
          `👤 New student registered: ${formData.full_name} (${formData.email}) - Added to All Registered Users`,
          formData.full_name
        );
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: '0.75rem', background: '#EFF6FF', borderRadius: '50%', color: 'var(--ucu-primary)', marginBottom: '0.75rem' }}>
            <GraduationCap size={32} />
          </div>
          <h2>Student Registration</h2>
          <p>Join the Uganda Christian University Study Group Network</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="full_name"
              className="form-control"
              placeholder="e.g. John Mukasa"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">University Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="e.g. jmukasa@ucu.ac.ug"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter secure password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Programme of Study</label>
            <select
              name="programme"
              className="form-control"
              value={formData.programme}
              onChange={handleChange}
            >
              {programmes.map((p, idx) => (
                <option key={idx} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Year of Study</label>
            <select
              name="year_of_study"
              className="form-control"
              value={formData.year_of_study}
              onChange={handleChange}
            >
              <option value="1">Year 1 (Freshman)</option>
              <option value="2">Year 2 (Sophomore)</option>
              <option value="3">Year 3 (Junior)</option>
              <option value="4">Year 4 (Senior / Law)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '1.5rem' }}>
            {loading ? 'Creating Student Account...' : 'Register as Student'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--ucu-primary)', fontWeight: 600 }}>
            Log In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
