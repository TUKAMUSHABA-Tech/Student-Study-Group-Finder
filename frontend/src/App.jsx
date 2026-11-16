import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import GroupsPage from './pages/GroupsPage';
import CreateGroupPage from './pages/CreateGroupPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import MyGroupsPage from './pages/MyGroupsPage';
import SessionsPage from './pages/SessionsPage';
import DiscussionsPage from './pages/DiscussionsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Wrapper layout for dashboard-styled internal pages
const DashboardWrapper = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <div className="app-container">
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:id" element={<GroupDetailsPage />} />

        {/* Protected Student / Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardWrapper>
                <DashboardPage />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-groups"
          element={
            <ProtectedRoute>
              <DashboardWrapper>
                <MyGroupsPage />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-group"
          element={
            <ProtectedRoute>
              <DashboardWrapper>
                <CreateGroupPage />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sessions"
          element={
            <ProtectedRoute>
              <DashboardWrapper>
                <SessionsPage />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/discussions"
          element={
            <ProtectedRoute>
              <DashboardWrapper>
                <DiscussionsPage />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardWrapper>
                <ProfilePage />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />

        {/* Administrator Protected Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardWrapper>
                <AdminDashboardPage />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
