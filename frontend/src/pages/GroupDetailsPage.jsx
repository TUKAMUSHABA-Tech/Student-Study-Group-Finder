import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Trash2, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2, 
  Send,
  LogOut,
  UserX
} from 'lucide-react';

const GroupDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [group, setGroup] = useState(null);
  const [membership, setMembership] = useState(null);
  const [members, setMembers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [posts, setPosts] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [newCommentText, setNewCommentText] = useState({});
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'sessions' | 'discussions'
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Session Modal state
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    session_date: '',
    session_time: '',
    location: '',
    description: ''
  });

  // Post form state
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    post_type: 'discussion'
  });

  const isLeader = group && user && (group.leader_id === user.id || isAdmin);
  const isMember = !!membership || isAdmin;

  const loadAllGroupData = async () => {
    try {
      // 1. Group details & user membership
      const groupRes = await api.get(`/groups/${id}`);
      if (groupRes.data.success) {
        setGroup(groupRes.data.group);
        setMembership(groupRes.data.userMembership);
      }

      // 2. Members roster
      if (isAuthenticated) {
        const memRes = await api.get(`/members/${id}/members`);
        if (memRes.data.success) setMembers(memRes.data.members);

        // 3. Sessions
        const sessRes = await api.get(`/sessions/group/${id}`);
        if (sessRes.data.success) setSessions(sessRes.data.sessions);

        // 4. Posts (if member)
        try {
          const postRes = await api.get(`/posts/group/${id}`);
          if (postRes.data.success) {
            setPosts(postRes.data.posts);
            // Fetch comments for posts
            for (const p of postRes.data.posts) {
              fetchComments(p.id);
            }
          }
        } catch (postErr) {
          // May 403 if not member, that's fine
        }
      }
    } catch (err) {
      console.error('Error loading group data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      if (res.data.success) {
        setCommentsMap(prev => ({ ...prev, [postId]: res.data.comments }));
      }
    } catch (err) {
      console.error('Failed to load comments for post', postId, err);
    }
  };

  useEffect(() => {
    loadAllGroupData();
  }, [id, isAuthenticated]);

  const handleJoin = async () => {
    try {
      const res = await api.post(`/members/${id}/join`);
      if (res.data.success) {
        setFeedback({ message: 'Successfully joined the study group!', type: 'success' });
        loadAllGroupData();
      }
    } catch (err) {
      setFeedback({ message: err.response?.data?.message || 'Error joining group.', type: 'danger' });
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this study group?')) return;
    try {
      const res = await api.post(`/members/${id}/leave`);
      if (res.data.success) {
        setFeedback({ message: 'You have left the study group.', type: 'success' });
        navigate('/my-groups');
      }
    } catch (err) {
      setFeedback({ message: err.response?.data?.message || 'Error leaving group.', type: 'danger' });
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this inactive student from the group?')) return;
    try {
      const res = await api.delete(`/members/${id}/members/${userId}`);
      if (res.data.success) {
        setFeedback({ message: 'Member removed successfully.', type: 'success' });
        setMembers(members.filter(m => m.user_id !== userId));
      }
    } catch (err) {
      setFeedback({ message: err.response?.data?.message || 'Error removing member.', type: 'danger' });
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/sessions', {
        group_id: id,
        ...sessionForm
      });
      if (res.data.success) {
        setShowSessionModal(false);
        setSessionForm({ title: '', session_date: '', session_time: '', location: '', description: '' });
        setFeedback({ message: 'Study session scheduled successfully!', type: 'success' });
        // Refresh sessions
        const sessRes = await api.get(`/sessions/group/${id}`);
        if (sessRes.data.success) setSessions(sessRes.data.sessions);
      }
    } catch (err) {
      setFeedback({ message: err.response?.data?.message || 'Error scheduling session.', type: 'danger' });
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Cancel and delete this scheduled study session?')) return;
    try {
      const res = await api.delete(`/sessions/${sessionId}`);
      if (res.data.success) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        setFeedback({ message: 'Session cancelled.', type: 'success' });
      }
    } catch (err) {
      setFeedback({ message: err.response?.data?.message || 'Error deleting session.', type: 'danger' });
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postForm.title || !postForm.content) return;
    try {
      const res = await api.post('/posts', {
        group_id: id,
        ...postForm
      });
      if (res.data.success) {
        setPostForm({ title: '', content: '', post_type: 'discussion' });
        setFeedback({ message: 'Post published!', type: 'success' });
        const postRes = await api.get(`/posts/group/${id}`);
        if (postRes.data.success) setPosts(postRes.data.posts);
      }
    } catch (err) {
      setFeedback({ message: err.response?.data?.message || 'Error publishing post.', type: 'danger' });
    }
  };

  const handleAddComment = async (postId) => {
    const text = newCommentText[postId];
    if (!text || !text.trim()) return;
    try {
      const res = await api.post(`/posts/${postId}/comments`, { content: text });
      if (res.data.success) {
        setNewCommentText({ ...newCommentText, [postId]: '' });
        fetchComments(postId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit comment');
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading study group workspace...</div>;
  }

  if (!group) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Study Group Not Found</h2>
        <Link to="/groups" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Groups
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '6px solid var(--ucu-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-course">{group.course_code}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--ucu-primary)', fontWeight: 600 }}>
                {group.faculty}
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--ucu-primary-dark)' }}>
              {group.name}
            </h1>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Users size={16} /> {members.length || group.member_count} Members
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={16} /> {group.meeting_location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={16} color="var(--ucu-accent)" /> Leader: <strong>{group.leader_name}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {isAuthenticated ? (
              isMember ? (
                <>
                  <span className="badge badge-student" style={{ padding: '0.4rem 0.8rem' }}>
                    {membership?.role === 'leader' ? 'Group Leader' : 'Joined Member'}
                  </span>
                  {group.leader_id !== user.id && (
                    <button onClick={handleLeave} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)' }}>
                      <LogOut size={14} /> Leave Group
                    </button>
                  )}
                </>
              ) : (
                <button onClick={handleJoin} className="btn btn-primary">
                  Join Study Group
                </button>
              )
            ) : (
              <Link to="/login" className="btn btn-primary">
                Sign In to Join Group
              </Link>
            )}
          </div>
        </div>
      </div>

      {feedback.message && (
        <div className={`alert alert-${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview & Members ({members.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          Study Sessions ({sessions.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'discussions' ? 'active' : ''}`}
          onClick={() => setActiveTab('discussions')}
        >
          Group Discussions & Q&A ({posts.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & MEMBERS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>About This Study Pod</h2>
              <p style={{ lineHeight: 1.6, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                {group.description}
              </p>
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#F8FAFC', borderRadius: 'var(--radius-sm)' }}>
                <strong>Meeting Venue / Link:</strong> {group.meeting_location}
              </div>
            </div>

            {/* Quick Session preview */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ fontSize: '1rem' }}>Next Upcoming Session</h3>
                <button className="btn btn-sm btn-outline" onClick={() => setActiveTab('sessions')}>View All</button>
              </div>
              {sessions.length > 0 ? (
                <div>
                  <h4 style={{ color: 'var(--ucu-primary)', fontWeight: 700 }}>{sessions[0].title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    📅 {sessions[0].session_date} at {sessions[0].session_time.substring(0, 5)} • 📍 {sessions[0].location}
                  </p>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No upcoming sessions scheduled yet.</p>
              )}
            </div>
          </div>

          {/* Members Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={18} /> Group Members Roster
              </h3>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Role</th>
                    {isLeader && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.membership_id || m.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{m.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {m.programme} (Yr {m.year_of_study})
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${m.member_role || m.role}`}>
                          {m.member_role || m.role}
                        </span>
                      </td>
                      {isLeader && (
                        <td>
                          {m.user_id !== group.leader_id && (
                            <button
                              onClick={() => handleRemoveMember(m.user_id)}
                              className="btn btn-sm btn-outline"
                              style={{ color: 'var(--danger)', padding: '0.2rem 0.5rem' }}
                              title="Remove inactive member"
                            >
                              <UserX size={14} /> Remove
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDY SESSIONS */}
      {activeTab === 'sessions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--ucu-primary-dark)' }}>
              Scheduled Study Sessions
            </h2>
            {isLeader && (
              <button onClick={() => setShowSessionModal(true)} className="btn btn-primary">
                <PlusCircle size={16} /> Schedule New Session
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Calendar size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p style={{ color: 'var(--text-muted)' }}>No study sessions scheduled yet for this group.</p>
              {isLeader && (
                <button onClick={() => setShowSessionModal(true)} className="btn btn-accent" style={{ marginTop: '1rem' }}>
                  Schedule the First Session
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {sessions.map((s) => (
                <div key={s.id} className="card" style={{ borderLeft: '4px solid var(--ucu-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ucu-primary-dark)' }}>
                      {s.title}
                    </h3>
                    {isLeader && (
                      <button
                        onClick={() => handleDeleteSession(s.id)}
                        className="btn btn-sm btn-outline"
                        style={{ color: 'var(--danger)', padding: '0.2rem 0.4rem' }}
                        title="Cancel Session"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} /> Date: <strong>{s.session_date}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} /> Time: <strong>{s.session_time.substring(0, 5)}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} /> Venue: <strong>{s.location}</strong>
                    </span>
                  </div>
                  {s.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                      {s.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Schedule Session Modal */}
          {showSessionModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1rem'
            }}>
              <div className="card" style={{ maxWidth: '500px', width: '100%', background: '#FFFFFF' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Schedule Study Session</h2>
                <form onSubmit={handleCreateSession}>
                  <div className="form-group">
                    <label className="form-label">Session Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Past Paper Revision Seminar"
                      value={sessionForm.title}
                      onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={sessionForm.session_date}
                        onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={sessionForm.session_time}
                        onChange={(e) => setSessionForm({ ...sessionForm, session_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location or Meeting Link</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Nkoyoyo Hall Lab 2 or Zoom Link"
                      value={sessionForm.location}
                      onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Agenda / Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="What topics or questions should students prepare?"
                      value={sessionForm.description}
                      onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="button" className="btn btn-outline" onClick={() => setShowSessionModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Schedule Session
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DISCUSSIONS & ANNOUNCEMENTS */}
      {activeTab === 'discussions' && (
        <div>
          {!isMember ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <MessageSquare size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <h3>Private Academic Discussion Room</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
                Join this study group to participate in discussions, post questions, and receive announcements.
              </p>
              <button onClick={handleJoin} className="btn btn-primary">
                Join Group to Access Discussions
              </button>
            </div>
          ) : (
            <div>
              {/* Post Creation Box */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--ucu-primary-dark)' }}>
                  Share an Academic Discussion, Question or Announcement
                </h3>
                <form onSubmit={handleCreatePost}>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Title or Topic (e.g. Question on React props vs state)..."
                        value={postForm.title}
                        onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <select
                        className="form-control"
                        value={postForm.post_type}
                        onChange={(e) => setPostForm({ ...postForm, post_type: e.target.value })}
                      >
                        <option value="discussion">Peer Discussion</option>
                        <option value="question">Academic Question</option>
                        {isLeader && <option value="announcement">Group Announcement</option>}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Write your explanation, question, or meeting notice..."
                      value={postForm.content}
                      onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary">
                      <Send size={14} /> Publish to Group
                    </button>
                  </div>
                </form>
              </div>

              {/* Feed of Posts */}
              {posts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No discussions posted yet in this group. Be the first to start the conversation!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {posts.map((post) => (
                    <div key={post.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <span className={`badge badge-${post.post_type}`} style={{ marginBottom: '0.4rem' }}>
                            {post.post_type}
                          </span>
                          <h4 style={{ fontSize: '1.15rem', color: 'var(--ucu-primary-dark)', fontWeight: 700 }}>
                            {post.title}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Posted by <strong>{post.author_name}</strong> ({post.author_programme}) • {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <p style={{ margin: '0.75rem 0 1.25rem', color: 'var(--text-main)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        {post.content}
                      </p>

                      {/* Comments Section */}
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                        <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 700 }}>
                          Answers & Peer Comments ({(commentsMap[post.id] || []).length})
                        </h5>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                          {(commentsMap[post.id] || []).map((comm) => (
                            <div key={comm.id} style={{ background: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                                <strong>{comm.author_name}</strong>
                                <span>{new Date(comm.created_at).toLocaleDateString()}</span>
                              </div>
                              <p style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{comm.content}</p>
                            </div>
                          ))}
                        </div>

                        {/* Add comment box */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Write an answer or comment..."
                            value={newCommentText[post.id] || ''}
                            onChange={(e) => setNewCommentText({ ...newCommentText, [post.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddComment(post.id);
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => handleAddComment(post.id)}
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupDetailsPage;
