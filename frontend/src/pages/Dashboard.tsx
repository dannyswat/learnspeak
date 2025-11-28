import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import type { UserJourney, TeacherStatistics } from '../types/user';
import Layout from '../components/Layout';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [journeys, setJourneys] = useState<UserJourney[]>([]);
  const [teacherStats, setTeacherStats] = useState<TeacherStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  const isLearner = user?.roles?.includes('learner');
  const isTeacher = user?.roles?.includes('teacher') || user?.roles?.includes('admin');

  useEffect(() => {
    if (user && isLearner) {
      loadLearnerData();
    } else if (user && isTeacher) {
      loadTeacherData();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLearner, isTeacher]);

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

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      const stats = await userService.getTeacherStatistics();
      setTeacherStats(stats);
    } catch (err) {
      console.error('Error loading teacher statistics:', err);
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
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">👥</span>
                <span className="text-sm text-gray-600 font-medium">Total Students</span>
              </div>
              <div className="text-3xl font-bold text-blue-600 font-['Poppins']">
                {teacherStats?.totalStudents || 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">Registered learners</div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">📝</span>
                <span className="text-sm text-gray-600 font-medium">Topics Created</span>
              </div>
              <div className="text-3xl font-bold text-green-600 font-['Poppins']">
                {teacherStats?.totalTopicsCreated || 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">Created by you</div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">✅</span>
                <span className="text-sm text-gray-600 font-medium">Topics Completion</span>
              </div>
              <div className="text-3xl font-bold text-purple-600 font-['Poppins']">
                {teacherStats?.totalTopicCompletions || 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">Completed by students</div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🗺️</span>
                <span className="text-sm text-gray-600 font-medium">Journey Subscriptions</span>
              </div>
              <div className="text-3xl font-bold text-orange-600 font-['Poppins']">
                {teacherStats?.journeySubscriptions || 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">Active assignments</div>
            </div>
          </div>
        )}
        
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button onClick={() => navigate('/words/new')} className="text-left px-4 py-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <div>
                <div className="font-medium text-gray-900">Add Words</div>
                <div className="text-xs text-gray-500">Create new vocabulary</div>
              </div>
            </button>
            <button onClick={() => navigate('/topics/new')} className="text-left px-4 py-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <div className="font-medium text-gray-900">Create Topic</div>
                <div className="text-xs text-gray-500">Organize your content</div>
              </div>
            </button>
            <button onClick={() => navigate('/journeys/new')} className="text-left px-4 py-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-3">
              <span className="text-2xl">🗺️</span>
              <div>
                <div className="font-medium text-gray-900">New Journey</div>
                <div className="text-xs text-gray-500">Build learning paths</div>
              </div>
            </button>
            <button onClick={() => navigate('/students')} className="text-left px-4 py-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <div className="font-medium text-gray-900">Manage Students</div>
                <div className="text-xs text-gray-500">View and assign journeys</div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Quick Links</h2>
          <div className="space-y-3">
            <button onClick={() => navigate('/words')} className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">View All Words →</button>
            <button onClick={() => navigate('/topics')} className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">View All Topics →</button>
            <button onClick={() => navigate('/journeys')} className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">View All Journeys →</button>
            <button onClick={() => navigate('/change-password')} className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">Change Password →</button>
            {user?.roles?.includes('admin') && (
              <button onClick={() => navigate('/admin/users')} className="w-full text-left px-4 py-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-red-700 font-medium">⚙️ Manage Users (Admin) →</button>
            )}
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
      {!loading && (<>
      <div className="mb-6 bg-white rounded-xl shadow-sm p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Account Settings</span>
          <button onClick={() => navigate('/change-password')} className="text-green-600 text-sm font-semibold hover:text-green-700 hover:underline transition-colors">Change Password →</button>
        </div>
      </div>
      <div className="flex justify-between items-center mb-6">
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
