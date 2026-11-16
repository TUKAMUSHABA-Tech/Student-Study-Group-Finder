import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Users, CalendarCheck, MessageSquare, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [featuredGroups, setFeaturedGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/groups');
        if (res.data.success) {
          setFeaturedGroups(res.data.groups.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load featured groups:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">UGANDA CHRISTIAN UNIVERSITY • ACADEMIC COLLABORATION PLATFORM</div>
        <h1 className="hero-title">Connect, Study & Excel With Your Peers At UCU</h1>
        <p className="hero-subtitle">
          Discover academic study groups for your course units, schedule revision sessions with group leaders, 
          and engage in productive private discussions to master your university coursework.
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-accent" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              Go to Student Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-accent" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                Create Student Account <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-outline" style={{ color: '#FFFFFF', borderColor: '#FFFFFF', padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                Sign In With UCU Email
              </Link>
            </>
          )}
          <Link to="/groups" className="btn btn-outline" style={{ color: '#E2E8F0', borderColor: 'rgba(255,255,255,0.4)', padding: '0.85rem 1.5rem' }}>
            <Search size={18} /> Browse Available Groups
          </Link>
        </div>
      </section>

      {/* Value Pillars */}
      <section style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--ucu-primary-dark)', fontWeight: 800 }}>
            Everything You Need For University Academic Excellence
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
            Built specifically to solve study group fragmentation across lecture halls and faculties.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="card" style={{ borderTop: '4px solid var(--ucu-primary)' }}>
            <div className="stat-icon-box" style={{ background: '#EFF6FF', color: '#2563EB', marginBottom: '1rem' }}>
              <Search size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--ucu-primary-dark)' }}>
              Course Unit Filtering
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Quickly locate study pods by course codes such as <code>BIT 1101</code>, <code>BBA 1104</code>, or <code>LAW 1100</code>, tailored specifically to your faculty.
            </p>
          </div>

          <div className="card" style={{ borderTop: '4px solid var(--ucu-accent)' }}>
            <div className="stat-icon-box" style={{ background: '#FFFBEB', color: '#D97706', marginBottom: '1rem' }}>
              <CalendarCheck size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--ucu-primary-dark)' }}>
              Structured Study Sessions
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Group leaders schedule in-person library meetings or virtual Zoom sessions with real-time dates, timings, and agenda descriptions.
            </p>
          </div>

          <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
            <div className="stat-icon-box" style={{ background: '#ECFDF5', color: '#059669', marginBottom: '1rem' }}>
              <MessageSquare size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--ucu-primary-dark)' }}>
              Academic Q&A & Announcements
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Ask difficult test questions, share lecture notes, clarify assignment requirements, and receive peer guidance in a focused forum.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Groups Preview */}
      <section style={{ background: '#F1F5F9', padding: '4rem 1.5rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--ucu-primary-dark)', fontWeight: 800 }}>
                Popular Active Study Groups
              </h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Join an existing circle or create your own pod today.
              </p>
            </div>
            <Link to="/groups" className="btn btn-outline" style={{ background: '#FFFFFF' }}>
              View All Groups <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {featuredGroups.map((g) => (
              <div key={g.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="badge badge-course">{g.course_code}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Users size={14} /> {g.member_count} members
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--ucu-primary-dark)', marginBottom: '0.5rem', fontWeight: 700 }}>
                  {g.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--ucu-primary)', fontWeight: 500, marginBottom: '0.75rem' }}>
                  {g.faculty}
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem', flex: 1, lineHeight: 1.5 }}>
                  {g.description.length > 110 ? g.description.substring(0, 110) + '...' : g.description}
                </p>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Led by <strong>{g.leader_name}</strong>
                  </span>
                  <Link to={`/groups/${g.id}`} className="btn btn-sm btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
