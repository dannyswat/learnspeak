import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import type { UserJourney } from '../types/user';
import Layout from '../components/Layout';

const MyJourneys: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<UserJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    if (user) {
      loadJourneys();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadJourneys = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await userService.getUserJourneys(user.id, undefined, 1, 100);
      setJourneys(response.userJourneys);
    } catch (err) {
      console.error('Error loading journeys:', err);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned':
        return '📋';
      case 'in_progress':
        return '🚀';
      case 'completed':
        return '✅';
      default:
        return '📌';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredJourneys = journeys.filter((j) => {
    if (filter === 'all') return true;
    return j.status === filter;
  });

  const stats = {
    total: journeys.length,
    assigned: journeys.filter((j) => j.status === 'assigned').length,
    inProgress: journeys.filter((j) => j.status === 'in_progress').length,
    completed: journeys.filter((j) => j.status === 'completed').length,
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 font-['Poppins']">🎯 My Learning Journeys</h2>
          <p className="mt-1 text-sm text-gray-500">Track your progress across all assigned journeys</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Total Journeys</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm p-6">
            <div className="text-sm text-blue-600 mb-1">Assigned</div>
            <div className="text-3xl font-bold text-blue-900">{stats.assigned}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm p-6">
            <div className="text-sm text-yellow-600 mb-1">In Progress</div>
            <div className="text-3xl font-bold text-yellow-900">{stats.inProgress}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm p-6">
            <div className="text-sm text-green-600 mb-1">Completed</div>
            <div className="text-3xl font-bold text-green-900">{stats.completed}</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6 flex gap-2">
          {[
            { value: 'all', label: 'All', count: stats.total },
            { value: 'assigned', label: 'Assigned', count: stats.assigned },
            { value: 'in_progress', label: 'In Progress', count: stats.inProgress },
            { value: 'completed', label: 'Completed', count: stats.completed },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as typeof filter)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          </div>
        )}

        {/* Journeys List */}
        {!loading && (
          <>
            {filteredJourneys.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredJourneys.map((userJourney) => (
                  <div
                    key={userJourney.id}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => userJourney.journey && navigate(`/journeys/${userJourney.journey.id}`)}
                  >
                    {/* Status Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          userJourney.status
                        )}`}
                      >
                        <span>{getStatusIcon(userJourney.status)}</span>
                        {userJourney.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Journey Info */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {userJourney.journey?.name || 'Unknown Journey'}
                    </h3>
                    
                    {userJourney.journey?.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {userJourney.journey.description}
                      </p>
                    )}

                    {/* Journey Details */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        🌐 {userJourney.journey?.language?.name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        📚 {userJourney.journey?.topicCount || 0} topics
                      </span>
                    </div>

                    {/* Assignment Info */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-500">
                          Assigned by{' '}
                          <span className="font-medium text-gray-700">
                            {userJourney.assignedBy?.name || 'Unknown'}
                          </span>
                        </div>
                        <div className="text-gray-500">
                          {formatDate(userJourney.assignedAt)}
                        </div>
                      </div>

                      {userJourney.startedAt && (
                        <div className="mt-2 text-sm text-gray-500">
                          Started: {formatDate(userJourney.startedAt)}
                        </div>
                      )}

                      {userJourney.completedAt && (
                        <div className="mt-2 text-sm text-green-600 font-medium">
                          Completed: {formatDate(userJourney.completedAt)}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    {userJourney.journey && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/journeys/${userJourney.journey!.id}`);
                        }}
                        className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        {userJourney.status === 'completed'
                          ? 'Review Journey'
                          : userJourney.status === 'in_progress'
                          ? 'Continue Learning'
                          : 'Start Journey'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No journeys found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter !== 'all'
                    ? `You don't have any ${filter.replace('_', ' ')} journeys.`
                    : "You haven't been assigned any learning journeys yet."}
                </p>
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    View All Journeys
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default MyJourneys;
