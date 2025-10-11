import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Welcome Section */}
      <div className="mb-4">
        <h1 className="text-3xl font-semibold text-gray-900 font-['Poppins'] mb-2">
          👋 Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Let's continue your learning journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Total Words */}
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="text-3xl">📚</span>
            <span className="text-sm text-gray-600 font-medium">Total Words</span>
          </div>
          <div className="text-2xl font-bold text-green-500 font-['Poppins']">156</div>
          <div className="text-xs text-gray-400 mt-0.5">Across all languages</div>
        </div>

        {/* Words Learning */}
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="text-3xl">�</span>
            <span className="text-sm text-gray-600 font-medium">Learning</span>
          </div>
          <div className="text-2xl font-bold text-green-500 font-['Poppins']">42</div>
          <div className="text-xs text-gray-400 mt-0.5">In progress</div>
        </div>

        {/* Daily Streak */}
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="text-3xl">🔥</span>
            <span className="text-sm text-gray-600 font-medium">Daily Streak</span>
          </div>
          <div className="text-2xl font-bold text-green-500 font-['Poppins']">7</div>
          <div className="text-xs text-gray-400 mt-0.5">Days in a row</div>
        </div>

        {/* Mastered */}
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="text-3xl">⭐</span>
            <span className="text-sm text-gray-600 font-medium">Mastered</span>
          </div>
          <div className="text-2xl font-bold text-green-500 font-['Poppins']">89</div>
          <div className="text-xs text-gray-400 mt-0.5">Words completed</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* Journey Section */}
        <div className="flex flex-col overflow-hidden min-h-0">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-semibold text-gray-900 font-['Poppins'] flex items-center gap-3">
              <span>🚀</span>
              <span>Your Learning Journeys</span>
            </h2>
            <button className="text-green-500 text-sm font-semibold hover:text-green-600 hover:underline transition-colors">
              View All →
            </button>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto pr-2">
            {/* Journey Card 1 */}
            <div className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-5">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 font-['Poppins'] flex items-center gap-3 mb-2">
                    <span className="text-3xl">🇫🇷</span>
                    <span>French Essentials</span>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Master everyday French vocabulary and common phrases
                  </p>
                  <div className="flex gap-4 text-sm text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <span>📖</span>
                      <span>45 words</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span>⏱️</span>
                      <span>~2 weeks</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span>📊</span>
                      <span>Beginner</span>
                    </span>
                  </div>
                </div>
                <button className="bg-green-500 text-white px-7 py-3 rounded-xl font-semibold text-sm hover:bg-green-600 hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(34,197,94,0.3)] hover:shadow-[0_6px_16px_rgba(34,197,94,0.4)] transition-all flex items-center gap-2 whitespace-nowrap">
                  <span>Continue</span>
                  <span>→</span>
                </button>
              </div>
              
              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 font-medium">Progress</span>
                  <span className="text-sm font-semibold text-green-500">65%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: '65%' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Journey Card 2 */}
            <div className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-5">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 font-['Poppins'] flex items-center gap-3 mb-2">
                    <span className="text-3xl">🇪🇸</span>
                    <span>Spanish Basics</span>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Learn fundamental Spanish words for daily conversations
                  </p>
                  <div className="flex gap-4 text-sm text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <span>📖</span>
                      <span>38 words</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span>⏱️</span>
                      <span>~10 days</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span>📊</span>
                      <span>Beginner</span>
                    </span>
                  </div>
                </div>
                <button className="bg-green-500 text-white px-7 py-3 rounded-xl font-semibold text-sm hover:bg-green-600 hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(34,197,94,0.3)] hover:shadow-[0_6px_16px_rgba(34,197,94,0.4)] transition-all flex items-center gap-2 whitespace-nowrap">
                  <span>Continue</span>
                  <span>→</span>
                </button>
              </div>
              
              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 font-medium">Progress</span>
                  <span className="text-sm font-semibold text-green-500">25%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: '25%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="flex flex-col gap-4">
          {/* New Word Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all shadow-md"
               onClick={() => navigate('/words/new')}>
            <div className="text-4xl mb-3">➕</div>
            <h3 className="text-lg font-semibold font-['Poppins'] mb-2">Add New Word</h3>
            <p className="text-sm opacity-95">Expand your vocabulary by adding new words to your collection</p>
          </div>

          {/* Practice Card */}
          <div className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white p-6 rounded-2xl cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all shadow-md">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-lg font-semibold font-['Poppins'] mb-2">Daily Practice</h3>
            <p className="text-sm opacity-95">Review and practice your words to strengthen your memory</p>
          </div>

          {/* Account Info Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold font-['Poppins'] mb-4 text-gray-900">Account Info</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Username:</span>
                <span className="ml-2 font-medium text-gray-900">{user?.username}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium text-gray-900">{user?.email}</span>
              </div>
              <div>
                <span className="text-gray-600">Role:</span>
                <span className="ml-2 font-medium text-gray-900">{user?.roles.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
