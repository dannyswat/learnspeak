import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  const isTeacher = user?.roles?.includes('teacher');
  const isLearner = user?.roles?.includes('learner');
  const isAdmin = user?.roles?.includes('admin');

  const handleNavigation = (path: string) => {
    navigate(path);
    setShowMobileMenu(false);
    setShowProfileMenu(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white px-4 sm:px-6 py-2 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left side - Logo */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2">
              <NavLink to="/"><img src="/learnspeak.png" alt="LearnSpeak" className="h-10 sm:h-12" /></NavLink>
            </div>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {/* Dashboard Link */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-3 xl:px-4 py-2 rounded-lg transition-colors text-sm xl:text-base"
            >
              <span>📊</span>
              <span>Dashboard</span>
            </button>

            {/* Words Link - Only for teachers/admin */}
            {isTeacher && (
              <button
                onClick={() => navigate('/words')}
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-3 xl:px-4 py-2 rounded-lg transition-colors text-sm xl:text-base"
              >
                <span>📚</span>
                <span>Words</span>
              </button>
            )}

            {/* Topics Link - Only for teachers/admin */}
            {isTeacher && (
              <button
                onClick={() => navigate('/topics')}
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-3 xl:px-4 py-2 rounded-lg transition-colors text-sm xl:text-base"
              >
                <span>📝</span>
                <span>Topics</span>
              </button>
            )}

            {/* Journeys Link - Only for teachers/admin */}
            {isTeacher && (
              <button
                onClick={() => navigate('/journeys')}
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-3 xl:px-4 py-2 rounded-lg transition-colors text-sm xl:text-base"
              >
                <span>🗺️</span>
                <span>Journeys</span>
              </button>
            )}

            {/* Students Link - Only for teachers/admin */}
            {isTeacher && (
              <button
                onClick={() => navigate('/students')}
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-3 xl:px-4 py-2 rounded-lg transition-colors text-sm xl:text-base"
              >
                <span>👥</span>
                <span>Students</span>
              </button>
            )}

            {/* My Journeys Link - Only for learners */}
            {isLearner && (
              <button
                onClick={() => navigate('/my-journeys')}
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-3 xl:px-4 py-2 rounded-lg transition-colors text-sm xl:text-base"
              >
                <span>🎯</span>
                <span>My Journeys</span>
              </button>
            )}

            {/* Admin Users Link - Only for admins */}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2 text-purple-700 hover:bg-purple-50 px-3 xl:px-4 py-2 rounded-lg transition-colors font-medium text-sm xl:text-base"
              >
                <span>⚙️</span>
                <span>Manage Users</span>
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
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/change-password');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    🔑 Change Password
                  </button>
                  {isAdmin && (
                    <>
                      <hr className="my-2" />
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/admin/users');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors font-medium"
                      >
                        ⚙️ Manage Users
                      </button>
                    </>
                  )}
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

          {/* Mobile Right Side - Profile and Hamburger */}
          <div className="flex lg:hidden items-center gap-3">
            {/* Profile Avatar - Mobile */}
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-lg transition-shadow"
            >
              {user?.profilePicUrl ? (
                <img
                  src={user.profilePicUrl}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm">{user ? getInitials(user.name) : 'U'}</span>
              )}
            </button>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors text-left"
              >
                <span className="text-xl">📊</span>
                <span className="font-medium">Dashboard</span>
              </button>

              {isTeacher && (
                <>
                  <button
                    onClick={() => handleNavigation('/words')}
                    className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors text-left"
                  >
                    <span className="text-xl">📚</span>
                    <span className="font-medium">Words</span>
                  </button>

                  <button
                    onClick={() => handleNavigation('/topics')}
                    className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors text-left"
                  >
                    <span className="text-xl">📝</span>
                    <span className="font-medium">Topics</span>
                  </button>

                  <button
                    onClick={() => handleNavigation('/journeys')}
                    className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors text-left"
                  >
                    <span className="text-xl">🗺️</span>
                    <span className="font-medium">Journeys</span>
                  </button>

                  <button
                    onClick={() => handleNavigation('/students')}
                    className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors text-left"
                  >
                    <span className="text-xl">👥</span>
                    <span className="font-medium">Students</span>
                  </button>
                </>
              )}

              {isLearner && (
                <button
                  onClick={() => handleNavigation('/my-journeys')}
                  className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors text-left"
                >
                  <span className="text-xl">🎯</span>
                  <span className="font-medium">My Journeys</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => handleNavigation('/admin/users')}
                  className="flex items-center gap-3 text-purple-700 hover:bg-purple-50 px-4 py-3 rounded-lg transition-colors text-left font-medium"
                >
                  <span className="text-xl">⚙️</span>
                  <span>Manage Users</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Profile Menu Dropdown */}
        {showProfileMenu && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            <div className="px-4 py-2 mb-2">
              <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleNavigation('/profile')}
                className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors text-left"
              >
                <span className="text-xl">👤</span>
                <span>Profile</span>
              </button>
              <button
                onClick={() => handleNavigation('/settings')}
                className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors text-left"
              >
                <span className="text-xl">⚙️</span>
                <span>Settings</span>
              </button>
              <button
                onClick={() => handleNavigation('/change-password')}
                className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors text-left"
              >
                <span className="text-xl">🔑</span>
                <span>Change Password</span>
              </button>
              {isAdmin && (
                <>
                  <hr className="my-2" />
                  <button
                    onClick={() => handleNavigation('/admin/users')}
                    className="flex items-center gap-3 text-purple-700 hover:bg-purple-50 px-4 py-3 rounded-lg transition-colors text-left font-medium"
                  >
                    <span className="text-xl">⚙️</span>
                    <span>Manage Users</span>
                  </button>
                </>
              )}
              <hr className="my-2" />
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowProfileMenu(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 text-red-600 hover:bg-red-50 px-4 py-3 rounded-lg transition-colors text-left"
              >
                <span className="text-xl">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        {children}
      </main>
    </div>
  );
};

export default Layout;
