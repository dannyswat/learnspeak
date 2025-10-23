import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import type { User, UserJourney } from '../types/user';
import Layout from '../components/Layout';

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<User | null>(null);
  const [journeys, setJourneys] = useState<UserJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const [userResponse, journeysResponse] = await Promise.all([
        userService.getUser(parseInt(id)),
        userService.getUserJourneys(parseInt(id), undefined, 1, 100),
      ]);
      setStudent(userResponse);
      setJourneys(journeysResponse.userJourneys);
    } catch (err) {
      console.error('Error loading student data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load student data');
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (error || !student) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Student not found</h2>
          {error && (
            <p className="mt-2 text-sm text-red-600">Error: {error}</p>
          )}
          <button
            onClick={() => navigate('/students')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Students
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate('/students')}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Students
        </button>

        {/* Student Profile Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              {student.profilePicUrl ? (
                <img
                  src={student.profilePicUrl}
                  alt={student.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-semibold">
                  {student.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{student.name}</h1>
              <p className="text-gray-600 mb-1">@{student.username}</p>
              <p className="text-gray-600 mb-4">{student.email}</p>
              <div className="flex gap-2 justify-center sm:justify-start">
                {student.roles?.map((role) => (
                  <span
                    key={role}
                    className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="w-full sm:w-auto flex justify-center sm:justify-end">
              <button
                onClick={() => navigate(`/journeys/assign?studentId=${student.id}`)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Assign Journey
              </button>
            </div>
          </div>
        </div>

        {/* Journeys Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assigned Journeys ({journeys.length})</h2>

          {journeys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {journeys.map((userJourney) => (
                <div
                  key={userJourney.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors cursor-pointer"
                  onClick={() => userJourney.journey && navigate(`/journeys/${userJourney.journey.id}`)}
                >
                  {/* Status Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        userJourney.status
                      )}`}
                    >
                      {userJourney.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Journey Info */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {userJourney.journey?.name || 'Unknown Journey'}
                  </h3>
                  {userJourney.journey?.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {userJourney.journey.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>🌐 {userJourney.journey?.language?.name || 'Unknown'}</span>
                    <span>📚 {userJourney.journey?.topicCount || 0} topics</span>
                  </div>

                  {/* Dates */}
                  <div className="text-sm text-gray-500">
                    <div>Assigned: {formatDate(userJourney.assignedAt)}</div>
                    {userJourney.startedAt && <div>Started: {formatDate(userJourney.startedAt)}</div>}
                    {userJourney.completedAt && (
                      <div className="text-green-600 font-medium">
                        Completed: {formatDate(userJourney.completedAt)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No journeys assigned to this student yet.</p>
              <button
                onClick={() => navigate(`/journeys/assign?studentId=${student.id}`)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Assign First Journey
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentDetail;
