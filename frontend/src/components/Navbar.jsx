import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { GraduationCap, LogOut, Bell, Shield, Users, BookOpen, Calendar, MessageSquare, CheckCheck } from 'lucide-react';

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
  const [showNotifs, setShowNotifs] = useState(false);
  const bellRef = useRef(null);

  const count = unreadCount(user?.id);

  const handleLogout = () => {
    logout();
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
        {isAuthenticated ? (
          <>
            {/* Notification Bell */}
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button
                onClick={handleBellClick}
                title="Notifications"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#FFFFFF',
                  position: 'relative',
                  transition: 'background 0.2s'
                }}
              >
                <Bell size={19} />
                {count > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: '#EF4444',
                    color: '#FFFFFF',
                    borderRadius: '9999px',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    minWidth: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    lineHeight: 1,
                    animation: 'pulse 1.5s infinite'
                  }}>
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifs && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '340px',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
                  zIndex: 9999,
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)'
                }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.9rem 1rem',
                    borderBottom: '1px solid var(--border-color)',
                    background: '#F8FAFC'
                  }}>
                    <span style={{ fontWeight: 700, color: 'var(--ucu-primary-dark)', fontSize: '0.95rem' }}>
                      🔔 Notifications
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {notifications.length} total
                    </span>
                  </div>

                  {/* Notification List */}
                  <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
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
                            display: 'flex',
                            gap: '0.75rem',
                            padding: '0.8rem 1rem',
                            borderBottom: '1px solid #F1F5F9',
                            background: isUnread ? '#EFF6FF' : '#FFFFFF',
                            transition: 'background 0.15s'
                          }}>
                            <div style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              background: '#F1F5F9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '2px'
                            }}>
                              {notifIcon(n.type)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '0.83rem', color: 'var(--text-dark)', margin: 0, lineHeight: 1.4 }}>
                                {n.message}
                              </p>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {timeAgo(n.timestamp)}
                              </span>
                            </div>
                            {isUnread && (
                              <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#2563EB',
                                marginTop: '8px',
                                flexShrink: 0
                              }} />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div style={{
                      padding: '0.6rem 1rem',
                      borderTop: '1px solid var(--border-color)',
                      background: '#F8FAFC',
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      <button
                        onClick={() => { markAllRead(user?.id); setShowNotifs(false); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--ucu-primary)',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <CheckCheck size={14} /> Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admin badge */}
            {isAdmin && (
              <Link
                to="/admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '6px',
                  padding: '0.3rem 0.65rem',
                  color: '#FCA5A5',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
                title="Admin Control Panel"
              >
                <Shield size={13} /> Admin
              </Link>
            )}

            {/* User Avatar + Name */}
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFFFFF', textDecoration: 'none' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'var(--ucu-primary-light)',
                border: '2px solid var(--ucu-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}>
                {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.full_name.split(' ')[0]}</div>
                <span className={`badge badge-${user.role}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
                  {user.role}
                </span>
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline"
              style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)' }}
              title="Log Out"
            >
              <LogOut size={14} />
              <span>Exit</span>
            </button>
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
      </div>
    </header>
  );
};

export default Navbar;
