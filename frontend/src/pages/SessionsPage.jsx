import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';

const SessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await api.get('/sessions/upcoming');
        if (res.data.success) {
          setSessions(res.data.sessions);
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--ucu-primary-dark)' }}>
          Upcoming Study Sessions Calendar
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Scheduled revision classes, seminar meetups, and exam prep sessions for your enrolled groups.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading scheduled sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h2 style={{ fontSize: '1.3rem', color: 'var(--ucu-primary-dark)', marginBottom: '0.5rem' }}>
            No Upcoming Sessions Scheduled
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            Your group leaders haven't scheduled any study sessions for the coming week yet, or you haven't joined any groups.
          </p>
          <Link to="/groups" className="btn btn-primary">
            Explore Study Groups
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {sessions.map((s) => (
            <div key={s.id} className="card" style={{ borderLeft: '5px solid var(--ucu-primary)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-course">{s.course_code}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--ucu-primary)', fontWeight: 600 }}>
                  {s.group_name}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ucu-primary-dark)', marginBottom: '0.5rem' }}>
                {s.title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={15} color="var(--ucu-primary)" /> <strong>Date:</strong> {s.session_date}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={15} color="var(--ucu-primary)" /> <strong>Time:</strong> {s.session_time.substring(0, 5)} EAT
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={15} color="var(--ucu-primary)" /> <strong>Venue:</strong> {s.location}
                </span>
              </div>

              {s.description && (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginBottom: '1.25rem', flex: 1 }}>
                  {s.description}
                </p>
              )}

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Organized by <strong>{s.created_by_name}</strong>
                </span>
                <Link to={`/groups/${s.group_id}`} className="btn btn-sm btn-outline">
                  View Group <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
