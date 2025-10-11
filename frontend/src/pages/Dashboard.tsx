import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo">
            <span>🌟</span>
            <span>LearnSpeak</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <div className="profile-pic">
              {user?.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="welcome-section">
          <h1>👋 Welcome back, {user?.name}!</h1>
          <p>Let's continue your learning journey</p>
        </div>

        <div className="info-card">
          <h2>🎉 Your account is set up!</h2>
          <p>Username: <strong>{user?.username}</strong></p>
          <p>Email: <strong>{user?.email}</strong></p>
          <p>Roles: <strong>{user?.roles.join(', ')}</strong></p>
          <div className="note">
            <p>This is a placeholder dashboard. The full dashboard with learning features will be implemented next.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
