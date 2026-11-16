import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Search, 
  Users, 
  PlusCircle, 
  Calendar, 
  MessageSquare, 
  UserCheck, 
  ShieldAlert 
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  return (
    <aside className="dashboard-sidebar">
      <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.5px' }}>
          Academic Navigation
        </p>
      </div>

      <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={18} />
        <span>Student Dashboard</span>
      </NavLink>

      <NavLink to="/groups" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <Search size={18} />
        <span>Find Study Groups</span>
      </NavLink>

      <NavLink to="/my-groups" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <Users size={18} />
        <span>My Study Pods</span>
      </NavLink>

      <NavLink to="/create-group" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <PlusCircle size={18} />
        <span>Create Study Group</span>
      </NavLink>

      <NavLink to="/sessions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <Calendar size={18} />
        <span>Study Sessions</span>
      </NavLink>

      <NavLink to="/discussions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <MessageSquare size={18} />
        <span>Group Discussions</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <UserCheck size={18} />
        <span>My Student Profile</span>
      </NavLink>

      {isAdmin && (
        <>
          <div style={{ padding: '1rem 0.75rem 0.25rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#EF4444', fontWeight: 700, letterSpacing: '0.5px' }}>
              Administration
            </p>
          </div>
          <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={{ color: '#DC2626' }}>
            <ShieldAlert size={18} />
            <span>Admin Analytics</span>
          </NavLink>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
