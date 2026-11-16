import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Users, MapPin, PlusCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const facultiesList = [
  'All Faculties',
  'Faculty of Science and Technology',
  'Faculty of Business and Administration',
  'Faculty of Law',
  'Faculty of Education and Arts',
  'Faculty of Social Sciences',
  'School of Medicine & Health Sciences'
];

const GroupsPage = () => {
  const { isAuthenticated } = useAuth();
  const [groups, setGroups] = useState([]);
  const [myGroupIds, setMyGroupIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('All Faculties');
  const [joiningId, setJoiningId] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const fetchGroups = async () => {
    setLoading(true);
    try {
      let url = '/groups';
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedFaculty && selectedFaculty !== 'All Faculties') {
        params.append('faculty', selectedFaculty);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        setGroups(res.data.groups);
      }

      // If logged in, fetch user's joined groups to adjust UI buttons
      if (isAuthenticated) {
        const myRes = await api.get('/groups/my-groups');
        if (myRes.data.success) {
          const ids = new Set(myRes.data.groups.map(g => g.id));
          setMyGroupIds(ids);
        }
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [selectedFaculty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGroups();
  };

  const handleJoin = async (groupId) => {
    if (!isAuthenticated) return;
    setJoiningId(groupId);
    try {
      const res = await api.post(`/members/${groupId}/join`);
      if (res.data.success) {
        setFeedback({ message: 'Successfully joined study group!', type: 'success' });
        setMyGroupIds(prev => new Set([...prev, groupId]));
        // Refresh group count
        setGroups(groups.map(g => g.id === groupId ? { ...g, member_count: g.member_count + 1 } : g));
      }
    } catch (err) {
      setFeedback({ message: err.response?.data?.message || 'Failed to join group.', type: 'danger' });
    } finally {
      setJoiningId(null);
      setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--ucu-primary-dark)' }}>
            Study Group Repository
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Discover and join academic peer learning circles across all university faculties.
          </p>
        </div>

        {isAuthenticated && (
          <Link to="/create-group" className="btn btn-primary">
            <PlusCircle size={16} /> Create New Study Group
          </Link>
        )}
      </div>

      {feedback.message && (
        <div className={`alert alert-${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr auto', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by course code (e.g. BIT 1101) or group title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-control"
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
            >
              {facultiesList.map((fac, idx) => (
                <option key={idx} value={fac}>{fac}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            <Search size={16} /> Search
          </button>
        </form>
      </div>

      {/* Group Cards Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Searching academic study groups...
        </div>
      ) : groups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1rem' }}>
            No study groups found matching your search criteria.
          </p>
          {isAuthenticated && (
            <Link to="/create-group" className="btn btn-accent">
              <PlusCircle size={16} /> Create the First Group for this Course
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {groups.map((group) => {
            const isMember = myGroupIds.has(group.id);
            return (
              <div key={group.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="badge badge-course">{group.course_code}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Users size={14} /> {group.member_count} members
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ucu-primary-dark)', marginBottom: '0.35rem' }}>
                  {group.name}
                </h3>

                <div style={{ fontSize: '0.85rem', color: 'var(--ucu-primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {group.faculty}
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                  {group.description}
                </p>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} /> {group.meeting_location}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Leader: <strong>{group.leader_name}</strong>
                  </span>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/groups/${group.id}`} className="btn btn-sm btn-outline">
                      Details
                    </Link>

                    {isAuthenticated && (
                      isMember ? (
                        <span className="btn btn-sm" style={{ background: '#ECFDF5', color: '#059669', cursor: 'default' }}>
                          <CheckCircle2 size={14} /> Joined
                        </span>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary"
                          disabled={joiningId === group.id}
                          onClick={() => handleJoin(group.id)}
                        >
                          {joiningId === group.id ? 'Joining...' : 'Join Group'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
