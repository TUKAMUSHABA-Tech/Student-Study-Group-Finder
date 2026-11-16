import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, AlertCircle, BookOpen } from 'lucide-react';

const faculties = [
  'Faculty of Science and Technology',
  'Faculty of Business and Administration',
  'Faculty of Law',
  'Faculty of Education and Arts',
  'Faculty of Social Sciences',
  'School of Medicine & Health Sciences'
];

const CreateGroupPage = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    course_code: '',
    faculty: 'Faculty of Science and Technology',
    description: '',
    meeting_location: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.course_code || !formData.description || !formData.meeting_location) {
      setError('Please complete all fields before creating a study group.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/groups', formData);
      if (res.data.success) {
        // Upgrade local role to leader if student
        updateUser({ role: 'leader' });
        navigate(`/groups/${res.data.groupId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create study group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={22} color="var(--ucu-primary)" /> Create an Academic Study Group
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              As creator, you will automatically be assigned as Group Leader with permissions to schedule sessions and post announcements.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Study Group Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="e.g. Web Development Mastery Pod"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Course Code or Course Unit</label>
              <input
                type="text"
                name="course_code"
                className="form-control"
                placeholder="e.g. BIT 1101 or CSC 1201"
                value={formData.course_code}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Faculty</label>
              <select
                name="faculty"
                className="form-control"
                value={formData.faculty}
                onChange={handleChange}
              >
                {faculties.map((f, idx) => (
                  <option key={idx} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Meeting Location or Online Platform</label>
            <input
              type="text"
              name="meeting_location"
              className="form-control"
              placeholder="e.g. Main Library Discussion Room 3 or Online via Google Meet"
              value={formData.meeting_location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Study Group Description & Learning Goals</label>
            <textarea
              name="description"
              className="form-control"
              rows={4}
              placeholder="Describe the topics covered, expected preparation, and target study pace..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/groups')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Group...' : 'Create Group & Become Leader'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupPage;
