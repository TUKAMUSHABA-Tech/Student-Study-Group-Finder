import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Search, Users, PlusCircle, Calendar, 
  MessageSquare, UserCheck, ShieldAlert, ChevronDown, ChevronUp
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside className="dashboard-sidebar">
      {/* Mobile toggle bar */}
      <button className="sidebar-mobile-toggle" onClick={() => setCollapsed(!collapsed)}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>📋 Navigation Menu</span>
        {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>

      <div className={`sidebar-nav-links ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="sidebar-section-title">
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.5px' }}>
            Academic Navigation
          </p>
        </div>

        {/* For regular students show Student Dashboard; for admins show Admin Control Center and remove Student Dashboard */}
        {!isAdmin ? (
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setCollapsed(true)}>
            <LayoutDashboard size={18} /> <span>Student Dashboard</span>
          </NavLink>
        ) : (
          <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={{ color: '#DC2626', fontWeight: 700 }} onClick={() => setCollapsed(true)}>
            <ShieldAlert size={18} /> <span>Admin Control Center</span>
          </NavLink>
        )}

        <NavLink to="/groups" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setCollapsed(true)}>
          <Search size={18} /> <span>Find Study Groups</span>
        </NavLink>
        <NavLink to="/my-groups" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setCollapsed(true)}>
          <Users size={18} /> <span>My Study Pods</span>
        </NavLink>
        <NavLink to="/create-group" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setCollapsed(true)}>
          <PlusCircle size={18} /> <span>Create Study Group</span>
        </NavLink>
        <NavLink to="/sessions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setCollapsed(true)}>
          <Calendar size={18} /> <span>Study Sessions</span>
        </NavLink>
        <NavLink to="/discussions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setCollapsed(true)}>
          <MessageSquare size={18} /> <span>Group Discussions</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setCollapsed(true)}>
          <UserCheck size={18} /> <span>My Student Profile</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
