import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isTeacher = user?.roles?.includes('teacher') || user?.roles?.includes('admin');
  const isLearner = user?.roles?.includes('learner');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white px-6 py-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left side - Logo */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-500 font-['Poppins']">
                🌱 LearnSpeak
              </span>
            </div>
          </div>

          {/* Right side - Navigation items */}
          <div className="flex items-center gap-6">
            {/* Dashboard Link */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
            >
              <span>📊</span>
              <span>Dashboard</span>
            </button>

            {/* Words Link - Only for teachers/admin */}
            {isTeacher && (
              <button
                onClick={() => navigate('/words')}
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
              >
                <span>📚</span>
                <span>Words</span>
              </button>
            )}

            {/* Topics Link - Only for teachers/admin */}
            {isTeacher && (
              <button
                onClick={() => navigate('/topics')}
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
              >
                <span>📝</span>
                <span>Topics</span>
              </button>
            )}

            {/* Journeys Link - Only for teachers/admin */}
            {isTeacher && (
              <button
                onClick={() => navigate('/journeys')}
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
              >
                <span>🗺️</span>
                <span>Journeys</span>
              </button>
            )}

            {/* Students Link - Only for teachers/admin */}
            {isTeacher && (
              <button
                onClick={() => navigate('/students')}
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
              >
                <span>👥</span>
                <span>Students</span>
              </button>
            )}

            {/* My Journeys Link - Only for learners */}
            {isLearner && (
              <button
                onClick={() => navigate('/my-journeys')}
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
              >
                <span>🎯</span>
                <span>My Journeys</span>
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-lg transition-shadow"
              >
                {user?.profilePicUrl ? (
                  <img
                    src={user.profilePicUrl}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{user ? getInitials(user.name) : 'U'}</span>
                )}
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    👤 Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    ⚙️ Settings
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-5">
        {children}
      </main>
    </div>
  );
};

export default Layout;
