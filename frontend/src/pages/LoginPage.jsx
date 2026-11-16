import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, KeyRound, ShieldCheck, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both your UCU email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or server unavailable.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for University Lecturer / Student evaluation
  const setDemoRole = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: '0.75rem', background: '#EFF6FF', borderRadius: '50%', color: 'var(--ucu-primary)', marginBottom: '0.75rem' }}>
            <KeyRound size={32} />
          </div>
          <h2>Student Portal Sign In</h2>
          <p>Access your study groups, sessions, and academic discussions</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">University Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. baker@ucu.ac.ug"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '1.25rem' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Login Helper for Evaluators */}
        <div className="demo-credentials-box">
          <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--ucu-primary-dark)' }}>
            Evaluation Demo Accounts:
          </strong>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            Click any role to autofill test credentials (Password: <code>Password123!</code>):
          </p>
          <div className="demo-btn-group">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setDemoRole('grace@ucu.ac.ug')}
              title="Year 1 BSIT Student"
            >
              <UserCheck size={13} /> Student (Grace)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setDemoRole('baker@ucu.ac.ug')}
              title="Group Leader (Web & C++)"
            >
              <KeyRound size={13} /> Group Leader (Baker)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setDemoRole('admin@ucu.ac.ug')}
              title="Platform Administrator"
            >
              <ShieldCheck size={13} /> Admin (Administrator)
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--ucu-primary)', fontWeight: 600 }}>
            Register as Student
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
