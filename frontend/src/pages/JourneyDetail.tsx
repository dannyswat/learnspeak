import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { journeyService } from '../services/journeyService';
import type { Journey } from '../types/journey';
import Layout from '../components/Layout';

const JourneyDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadJourney(parseInt(id));
    }
  }, [id]);

  const loadJourney = async (journeyId: number) => {
    try {
      setLoading(true);
      const data = await journeyService.getJourney(journeyId, true);
      setJourney(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load journey');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this journey?')) {
      return;
    }

    try {
      if (id) {
        await journeyService.deleteJourney(parseInt(id));
        navigate('/journeys');
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to delete journey');
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading journey...</div>
        </div>
      </Layout>
    );
  }

  if (error || !journey) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-600 mb-4">{error || 'Journey not found'}</div>
          <button
            onClick={() => navigate('/journeys')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Back to Journeys
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <button
              onClick={() => navigate('/journeys')}
              className="hover:text-green-600"
            >
              Journeys
            </button>
            <span>›</span>
            <span className="text-gray-900">{journey.name}</span>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 font-['Poppins'] mb-2">
                {journey.name}
              </h2>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600">{journey.language?.name}</span>
                {journey.createdBy && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-600">Created by {journey.createdBy.name}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/journeys/${journey.id}/edit`)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        {journey.description && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{journey.description}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Topics</p>
                <p className="text-2xl font-bold text-gray-900">{journey.topicCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Words</p>
                <p className="text-2xl font-bold text-gray-900">{journey.totalWords}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assigned Users</p>
                <p className="text-2xl font-bold text-gray-900">{journey.assignedToCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Topics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Topics ({journey.topics?.length || 0})
          </h3>

          {journey.topics && journey.topics.length > 0 ? (
            <div className="space-y-3">
              {journey.topics.map((topic, index) => (
                <div
                  key={topic.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => navigate(`/topics/${topic.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {topic.name}
                          </h4>
                          {topic.description && (
                            <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                          )}
                        </div>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${getLevelBadgeColor(topic.level)}`}>
                          {topic.level}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          {topic.wordCount} words
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          {topic.quizCount} quizzes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No topics in this journey yet</p>
              <button
                onClick={() => navigate(`/journeys/${journey.id}/edit`)}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Add Topics
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JourneyDetail;
