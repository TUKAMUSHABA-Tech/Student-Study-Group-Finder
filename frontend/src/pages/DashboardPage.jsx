import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  PlusCircle, 
  Search, 
  ArrowRight, 
  Clock, 
  MapPin, 
  Bell 
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentGroups, setRecentGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [groupsRes, sessionsRes, allGroupsRes] = await Promise.all([
          api.get('/groups/my-groups'),
          api.get('/sessions/upcoming'),
          api.get('/groups')
        ]);

        if (groupsRes.data.success) setMyGroups(groupsRes.data.groups);
        if (sessionsRes.data.success) setUpcomingSessions(sessionsRes.data.sessions);
        if (allGroupsRes.data.success) setRecentGroups(allGroupsRes.data.groups.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading your student dashboard...</div>;
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--ucu-primary) 0%, var(--ucu-primary-dark) 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem 2.5rem',
        color: '#FFFFFF',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <span style={{
            display: 'inline-block',
            background: 'rgba(230, 162, 23, 0.25)',
            color: 'var(--ucu-accent)',
            padding: '0.2rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '0.5rem'
          }}>
            {user.programme} • Year {user.year_of_study}
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            Welcome back, {user.full_name}! 👋
          </h1>
          <p style={{ color: '#E2E8F0', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            Ready for productive study sessions and peer discussions today?
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/create-group" className="btn btn-accent">
            <PlusCircle size={16} /> Create Group
          </Link>
          <Link to="/groups" className="btn btn-outline" style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)' }}>
            <Search size={16} /> Explore Groups
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{myGroups.length}</div>
            <div className="stat-label">Study Groups Joined</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#ECFDF5', color: '#059669' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="stat-value">{upcomingSessions.length}</div>
            <div className="stat-label">Upcoming Sessions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#FFFBEB', color: '#D97706' }}>
            <Bell size={24} />
          </div>
          <div>
            <div className="stat-value">{recentGroups.length}</div>
            <div className="stat-label">Campus Groups Active</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#F3E8FF', color: '#9333EA' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="stat-value">Active</div>
            <div className="stat-label">Peer Discussions</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left upcoming sessions, Right my groups & quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Upcoming Study Sessions */}
        <div>
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="var(--ucu-primary)" /> Upcoming Study Sessions
              </h2>
              <Link to="/sessions" style={{ fontSize: '0.85rem', color: 'var(--ucu-primary)', fontWeight: 600 }}>
                View All
              </Link>
            </div>

            {upcomingSessions.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Calendar size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <p>No study sessions currently scheduled for your groups.</p>
                <Link to="/groups" className="btn btn-sm btn-primary" style={{ marginTop: '1rem' }}>
                  Join More Groups
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcomingSessions.map((session) => (
                  <div 
                    key={session.id} 
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1rem',
                      background: '#F8FAFC',
                      borderLeft: '4px solid var(--ucu-primary)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <span className="badge badge-course">{session.course_code}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--ucu-primary)', fontWeight: 600 }}>
                        {session.group_name}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ucu-primary-dark)', marginBottom: '0.4rem' }}>
                      {session.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={14} /> {session.session_date} at {session.session_time.substring(0, 5)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={14} /> {session.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Joined Study Pods & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* My Study Pods Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} color="var(--ucu-primary)" /> My Study Pods
              </h2>
              <Link to="/my-groups" style={{ fontSize: '0.85rem', color: 'var(--ucu-primary)', fontWeight: 600 }}>
                Manage ({myGroups.length})
              </Link>
            </div>

            {myGroups.length === 0 ? (
              <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>You haven't joined any study groups yet.</p>
                <Link to="/groups" className="btn btn-sm btn-accent" style={{ marginTop: '0.75rem' }}>
                  Explore Campus Groups
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myGroups.map((group) => (
                  <Link
                    key={group.id}
                    to={`/groups/${group.id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: '#F8FAFC',
                      border: '1px solid var(--border-color)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--ucu-primary-dark)' }}>
                        {group.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {group.course_code} • {group.member_count} members
                      </div>
                    </div>
                    <span className={`badge badge-${group.membership_role}`}>
                      {group.membership_role}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="card" style={{ background: '#F8FAFC' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ucu-primary-dark)', marginBottom: '0.75rem' }}>
              Quick Student Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/create-group" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                <PlusCircle size={16} /> Schedule & Start a New Group
              </Link>
              <Link to="/groups" className="btn btn-outline" style={{ justifyContent: 'flex-start', background: '#FFFFFF' }}>
                <Search size={16} /> Filter Groups by Course & Faculty
              </Link>
              <Link to="/discussions" className="btn btn-outline" style={{ justifyContent: 'flex-start', background: '#FFFFFF' }}>
                <MessageSquare size={16} /> Academic Discussion Board
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
