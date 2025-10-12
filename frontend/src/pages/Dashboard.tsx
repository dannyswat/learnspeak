import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import type { UserJourney } from '../types/user';
import Layout from '../components/Layout';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [journeys, setJourneys] = useState<UserJourney[]>([]);
  const [loading, setLoading] = useState(true);

  const isLearner = user?.roles?.includes('learner');
  const isTeacher = user?.roles?.includes('teacher') || user?.roles?.includes('admin');

  useEffect(() => {
    if (user && isLearner) {
      loadLearnerData();
    } else {
      setLoading(false);
    }
  }, [user, isLearner]);

  const loadLearnerData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await userService.getUserJourneys(user.id, undefined, 1, 100);
      setJourneys(response.userJourneys);
    } catch (err) {
      console.error('Error loading learner data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalJourneys: journeys.length,
    inProgress: journeys.filter((j) => j.status === 'in_progress').length,
    completed: journeys.filter((j) => j.status === 'completed').length,
    avgProgress: journeys.length > 0 
      ? Math.round(journeys.reduce((sum, j) => sum + (j.progress || 0), 0) / journeys.length)
      : 0,
  };

  if (isTeacher) {
    return (
      <Layout>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 font-['Poppins'] mb-2">
            👋 Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Manage your content and students</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => navigate('/words/new')} className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-left">
            <div className="text-4xl mb-3">📚</div>
            <div className="font-semibold text-lg mb-1">Add Words</div>
            <div className="text-sm text-green-100">Create new vocabulary</div>
          </button>
          <button onClick={() => navigate('/topics/new')} className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-left">
            <div className="text-4xl mb-3">📝</div>
            <div className="font-semibold text-lg mb-1">Create Topic</div>
            <div className="text-sm text-blue-100">Organize your content</div>
          </button>
          <button onClick={() => navigate('/journeys/new')} className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-left">
            <div className="text-4xl mb-3">🗺️</div>
            <div className="font-semibold text-lg mb-1">New Journey</div>
            <div className="text-sm text-purple-100">Build learning paths</div>
          </button>
          <button onClick={() => navigate('/students')} className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-left">
            <div className="text-4xl mb-3">👥</div>
            <div className="font-semibold text-lg mb-1">Manage Students</div>
            <div className="text-sm text-orange-100">View and assign journeys</div>
          </button>
        </div>
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Quick Links</h2>
          <div className="space-y-3">
            <button onClick={() => navigate('/words')} className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">View All Words →</button>
            <button onClick={() => navigate('/topics')} className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">View All Topics →</button>
            <button onClick={() => navigate('/journeys')} className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">View All Journeys →</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 font-['Poppins'] mb-2">👋 Welcome back, {user?.name}!</h1>
        <p className="text-gray-600">Let's continue your learning journey</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3"><span className="text-4xl">🎯</span><span className="text-sm text-gray-600 font-medium">Total Journeys</span></div>
          <div className="text-3xl font-bold text-green-600 font-['Poppins']">{stats.totalJourneys}</div>
          <div className="text-xs text-gray-400 mt-1">Assigned to you</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3"><span className="text-4xl">🚀</span><span className="text-sm text-gray-600 font-medium">In Progress</span></div>
          <div className="text-3xl font-bold text-yellow-600 font-['Poppins']">{stats.inProgress}</div>
          <div className="text-xs text-gray-400 mt-1">Currently learning</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3"><span className="text-4xl">✅</span><span className="text-sm text-gray-600 font-medium">Completed</span></div>
          <div className="text-3xl font-bold text-green-600 font-['Poppins']">{stats.completed}</div>
          <div className="text-xs text-gray-400 mt-1">Finished journeys</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3"><span className="text-4xl">📊</span><span className="text-sm text-gray-600 font-medium">Avg Progress</span></div>
          <div className="text-3xl font-bold text-blue-600 font-['Poppins']">{stats.avgProgress}%</div>
          <div className="text-xs text-gray-400 mt-1">Across all journeys</div>
        </div>
      </div>
      {loading && <div className="flex justify-center py-12"><div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div></div>}
      {!loading && (<><div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 font-['Poppins']">🗺️ Your Learning Journeys</h2>
        <button onClick={() => navigate('/my-journeys')} className="text-green-600 text-sm font-semibold hover:text-green-700 hover:underline transition-colors">View All →</button>
      </div>
      {journeys.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">{journeys.slice(0, 4).map((uj) => (<div key={uj.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer" onClick={() => uj.journey && navigate(`/journeys/${uj.journey.id}`)}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 font-['Poppins'] flex-1">{uj.journey?.name || 'Unknown Journey'}</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(uj.status)}`}>{uj.status.replace('_', ' ').toUpperCase()}</span>
        </div>
        {uj.journey?.description && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{uj.journey.description}</p>}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2"><span>Progress</span><span className="font-semibold">{Math.round(uj.progress || 0)}%</span></div>
          <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-green-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uj.progress || 0}%` }}></div></div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">�� {uj.journey?.language?.name || 'Unknown'}</span>
          <span className="flex items-center gap-1">📚 {uj.completedTopics || 0}/{uj.totalTopics || 0} topics</span>
        </div>
        {uj.nextTopic && <div className="pt-4 border-t border-gray-200"><div className="text-xs text-gray-500 mb-1">Next Topic:</div><div className="text-sm font-medium text-green-600">{uj.nextTopic.name}</div></div>}
        <button onClick={(e) => { e.stopPropagation(); if (uj.journey) navigate(`/journeys/${uj.journey.id}`); }} className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">{uj.status === 'completed' ? 'Review Journey' : uj.status === 'in_progress' ? 'Continue Learning' : 'Start Journey'}</button>
      </div>))}</div>) : (<div className="bg-white rounded-xl p-12 text-center shadow-sm">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Journeys Yet</h3>
        <p className="text-gray-600 mb-6">Your teacher will assign learning journeys to you soon.</p>
      </div>)}</>)}
    </Layout>
  );
};
