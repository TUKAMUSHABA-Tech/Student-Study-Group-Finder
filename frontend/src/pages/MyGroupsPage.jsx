import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, PlusCircle, Search, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

const MyGroupsPage = () => {
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyGroups = async () => {
      try {
        const res = await api.get('/groups/my-groups');
        if (res.data.success) {
          setMyGroups(res.data.groups);
        }
      } catch (err) {
        console.error('Failed to load my groups:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyGroups();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--ucu-primary-dark)' }}>
            My Enrolled Study Pods
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            All academic circles and groups you lead or participate in as a student.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/create-group" className="btn btn-primary">
            <PlusCircle size={16} /> Create Group
          </Link>
          <Link to="/groups" className="btn btn-outline">
            <Search size={16} /> Explore More
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading your study pods...</div>
      ) : myGroups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h2 style={{ fontSize: '1.4rem', color: 'var(--ucu-primary-dark)', marginBottom: '0.5rem' }}>
            You haven't joined any study groups yet!
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            Joining a study pod helps you connect with peers, access dedicated discussion boards, and attend scheduled revision sessions.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/groups" className="btn btn-primary">
              <Search size={16} /> Find Groups for Your Course
            </Link>
            <Link to="/create-group" className="btn btn-accent">
              <PlusCircle size={16} /> Start a New Group
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {myGroups.map((g) => (
            <div key={g.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-course">{g.course_code}</span>
                <span className={`badge badge-${g.membership_role}`}>
                  {g.membership_role === 'leader' ? 'Group Leader' : 'Active Member'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ucu-primary-dark)', marginBottom: '0.35rem' }}>
                {g.name}
              </h3>

              <div style={{ fontSize: '0.85rem', color: 'var(--ucu-primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
                {g.faculty}
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                {g.description}
              </p>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={14} /> {g.meeting_location}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {g.member_count} enrolled peers
                </span>
                <Link to={`/groups/${g.id}`} className="btn btn-sm btn-primary">
                  Open Workspace <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGroupsPage;
