import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Users, ArrowRight, Filter, AlertCircle } from 'lucide-react';

const DiscussionsPage = () => {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [posts, setPosts] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [newComment, setNewComment] = useState({});
  const [loading, setLoading] = useState(true);

  // New post modal / form state
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    post_type: 'discussion'
  });

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/groups/my-groups');
        if (res.data.success && res.data.groups.length > 0) {
          setMyGroups(res.data.groups);
          setSelectedGroupId(res.data.groups[0].id);
        }
      } catch (err) {
        console.error('Failed to load my groups:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupPosts(selectedGroupId);
    }
  }, [selectedGroupId]);

  const loadGroupPosts = async (groupId) => {
    try {
      const res = await api.get(`/posts/group/${groupId}`);
      if (res.data.success) {
        setPosts(res.data.posts);
        for (const p of res.data.posts) {
          loadComments(p.id);
        }
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  };

  const loadComments = async (postId) => {
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      if (res.data.success) {
        setCommentsMap(prev => ({ ...prev, [postId]: res.data.comments }));
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content || !selectedGroupId) return;

    try {
      const res = await api.post('/posts', {
        group_id: selectedGroupId,
        ...newPost
      });
      if (res.data.success) {
        setNewPost({ title: '', content: '', post_type: 'discussion' });
        loadGroupPosts(selectedGroupId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating post');
    }
  };

  const handleAddComment = async (postId) => {
    const text = newComment[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.post(`/posts/${postId}/comments`, { content: text });
      if (res.data.success) {
        setNewComment({ ...newComment, [postId]: '' });
        loadComments(postId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting reply');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--ucu-primary-dark)' }}>
            Academic Discussions & Q&A Board
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Share questions, exchange lecture explanations, and follow announcements inside your study pods.
          </p>
        </div>

        {myGroups.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active Pod:</span>
            <select
              className="form-control"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              style={{ minWidth: '220px' }}
            >
              {myGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.course_code} - {g.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading discussions...</div>
      ) : myGroups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h2 style={{ fontSize: '1.3rem', color: 'var(--ucu-primary-dark)', marginBottom: '0.5rem' }}>
            Join a Group to Access Discussions
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
            Discussion rooms are protected and exclusive to registered members of each study pod.
          </p>
          <Link to="/groups" className="btn btn-primary">
            Explore Study Groups
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          
          {/* Post Creation Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ucu-primary-dark)', marginBottom: '1rem' }}>
              Post to Selected Study Pod
            </h3>
            <form onSubmit={handleCreatePost}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter discussion title or question..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <select
                    className="form-control"
                    value={newPost.post_type}
                    onChange={(e) => setNewPost({ ...newPost, post_type: e.target.value })}
                  >
                    <option value="discussion">Peer Discussion</option>
                    <option value="question">Academic Question</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Elaborate on your question or message for your study group..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">
                  <Send size={14} /> Submit Post
                </button>
              </div>
            </form>
          </div>

          {/* Posts Feed */}
          {posts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              No discussions yet in this study pod. Start the conversation by sharing a question above!
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
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--ucu-primary-dark)', fontWeight: 700 }}>
                        {post.title}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Posted by <strong>{post.author_name}</strong> • {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: '0.75rem 0 1.25rem', color: 'var(--text-main)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    {post.content}
                  </p>

                  {/* Answers & Replies */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                    <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 700 }}>
                      Replies ({(commentsMap[post.id] || []).length})
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

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Write a reply or answer..."
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
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
  );
};

export default DiscussionsPage;
