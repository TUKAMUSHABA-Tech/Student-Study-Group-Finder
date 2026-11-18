import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { GraduationCap, LogOut, Bell, Shield, Users, BookOpen, Calendar, MessageSquare, CheckCheck, Menu, X } from 'lucide-react';

const notifIcon = (type) => {
  if (type === 'group_created') return <BookOpen size={14} color="#2563EB" />;
  if (type === 'session_created') return <Calendar size={14} color="#059669" />;
  if (type === 'member_joined') return <Users size={14} color="#9333EA" />;
  if (type === 'post_created') return <MessageSquare size={14} color="#D97706" />;
  if (type === 'user_registered') return <Users size={14} color="#059669" />;
  return <Bell size={14} color="#6B7280" />;
};

const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const bellRef = useRef(null);

  const count = unreadCount(user?.id);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const handleBellClick = () => {
    setShowNotifs(prev => !prev);
    if (!showNotifs && user?.id) {
      markAllRead(user.id);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="navbar">
      {/* Brand */}
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

      {/* Right side controls */}
      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            {/* Notification Bell */}
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button onClick={handleBellClick} title="Notifications" className="navbar-bell-btn">
                <Bell size={19} />
                {count > 0 && (
                  <span className="navbar-bell-badge">{count > 9 ? '9+' : count}</span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifs && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span style={{ fontWeight: 700, color: 'var(--ucu-primary-dark)', fontSize: '0.95rem' }}>🔔 Notifications</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notifications.length} total</span>
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Bell size={28} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                        <p style={{ fontSize: '0.88rem' }}>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(n => {
                        const isUnread = !n.readBy.includes(user?.id);
                        return (
                          <div key={n.id} style={{
                            display: 'flex', gap: '0.6rem', padding: '0.7rem 0.85rem',
                            borderBottom: '1px solid #F1F5F9', background: isUnread ? '#EFF6FF' : '#FFFFFF'
                          }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {notifIcon(n.type)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-dark)', margin: 0, lineHeight: 1.4 }}>{n.message}</p>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{timeAgo(n.timestamp)}</span>
                            </div>
                            {isUnread && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2563EB', marginTop: '6px', flexShrink: 0 }} />}
                          </div>
                        );
                      })
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="notif-footer">
                      <button onClick={() => { markAllRead(user?.id); setShowNotifs(false); }}
                        style={{ background: 'none', border: 'none', color: 'var(--ucu-primary)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCheck size={14} /> Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admin badge - desktop */}
            {isAdmin && (
              <Link to="/admin" className="navbar-admin-badge hide-on-mobile" title="Admin Control Panel">
                <Shield size={13} /> Admin
              </Link>
            )}

            {/* User Avatar + Name - desktop */}
            <Link to="/profile" className="navbar-user-info hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFFFFF', textDecoration: 'none' }}>
              <div className="navbar-avatar">{user.full_name ? user.full_name[0].toUpperCase() : 'U'}</div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.full_name.split(' ')[0]}</div>
                <span className={`badge badge-${user.role}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>{user.role}</span>
              </div>
            </Link>

            {/* Logout - desktop */}
            <button onClick={handleLogout} className="btn btn-sm btn-outline hide-on-mobile" style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)' }} title="Log Out">
              <LogOut size={14} /> <span>Exit</span>
            </button>

            {/* Mobile hamburger button */}
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link to="/login" className="btn btn-sm btn-outline" style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }}>Log In</Link>
            <Link to="/register" className="btn btn-sm btn-accent">Register</Link>
          </div>
        )}
      </div>

      {/* Mobile slide-down panel */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-nav-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', background: '#F8FAFC' }}>
              <div className="navbar-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ucu-primary-dark)' }}>{user.full_name}</div>
                <span className={`badge badge-${user.role}`} style={{ fontSize: '0.7rem' }}>{user.role}</span>
              </div>
            </div>
            {isAdmin && (
              <Link to="/admin" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)} style={{ color: '#DC2626' }}>
                <Shield size={18} /> Admin Dashboard
              </Link>
            )}
            <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <Users size={18} /> My Profile
            </Link>
            <div style={{ borderTop: '1px solid var(--border-color)', padding: '0.25rem 0' }}>
              <button onClick={handleLogout} className="mobile-nav-link" style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', color: 'var(--danger)', cursor: 'pointer', fontFamily: 'inherit' }}>
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
