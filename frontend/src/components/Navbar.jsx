import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User, Menu, X, Shield, PlusCircle, BookOpen } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="navbar-logo-badge">
          <GraduationCap size={22} />
        </div>
        <div>
          <span>UCU Study Groups</span>
          <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--ucu-accent)', fontWeight: 400 }}>
            Uganda Christian University
          </span>
        </div>
      </Link>

      {/* Desktop Navigation */}
      <nav className="navbar-links" style={{ display: 'flex' }}>
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          Home
        </Link>
        <Link to="/groups" className={`nav-link ${isActive('/groups') ? 'active' : ''}`}>
          Explore Groups
        </Link>

        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
              Dashboard
            </Link>
            <Link to="/my-groups" className={`nav-link ${isActive('/my-groups') ? 'active' : ''}`}>
              My Groups
            </Link>
            <Link to="/sessions" className={`nav-link ${isActive('/sessions') ? 'active' : ''}`}>
              Study Sessions
            </Link>
            <Link to="/discussions" className={`nav-link ${isActive('/discussions') ? 'active' : ''}`}>
              Discussions
            </Link>

            {isAdmin && (
              <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`} style={{ color: '#FCA5A5' }}>
                <Shield size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Admin
              </Link>
            )}

            <div className="nav-user-menu" style={{ marginLeft: '1rem' }}>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFFFFF' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--ucu-primary-light)',
                  border: '1px solid var(--ucu-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.full_name.split(' ')[0]}</div>
                  <span className={`badge badge-${user.role}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                    {user.role}
                  </span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="btn btn-sm btn-outline"
                style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)' }}
                title="Log Out"
              >
                <LogOut size={14} />
                <span>Exit</span>
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/login" className="btn btn-sm btn-outline" style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }}>
              Log In
            </Link>
            <Link to="/register" className="btn btn-sm btn-accent">
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
