import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { topicService } from '../services/topicService';
import type { Topic } from '../types/topic';
import Layout from '../components/Layout';

const TopicLearner: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flashcardCompleted, _setFlashcardCompleted] = useState(false);

  const journeyId = searchParams.get('journeyId');

  useEffect(() => {
    if (id) {
      loadTopic(parseInt(id));
    }
  }, [id]);

  const loadTopic = async (topicId: number) => {
    try {
      setLoading(true);
      const data = await topicService.getTopic(topicId, true);
      setTopic(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load topic');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading topic...</div>
        </div>
      </Layout>
    );
  }

  if (error || !topic) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-600 mb-4">{error || 'Topic not found'}</div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Go Back
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
          <button
            onClick={() => {
              if (journeyId) {
                navigate(`/journeys/${journeyId}`);
              } else {
                navigate(-1);
              }
            }}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {journeyId ? 'Back to Journey' : 'Back'}
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 font-['Poppins'] mb-2">
                {topic.name}
              </h2>
              <div className="flex items-center gap-3 text-sm">
                <span className={`px-3 py-1 rounded-full font-medium ${
                  topic.level === 'beginner' ? 'bg-green-100 text-green-800' :
                  topic.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {topic.level}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">{topic.language?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {topic.description && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">About this Topic</h3>
            <p className="text-gray-700">{topic.description}</p>
          </div>
        )}

        {/* Topic Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-800">Words to Learn</div>
                <div className="text-3xl font-bold text-blue-900">{topic.wordCount}</div>
              </div>
              <div className="text-5xl">📝</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-purple-800">Practice Activities</div>
                <div className="text-3xl font-bold text-purple-900">4</div>
              </div>
              <div className="text-5xl">🎯</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-green-800">Estimated Time</div>
                <div className="text-3xl font-bold text-green-900">{Math.ceil(topic.wordCount / 2)}</div>
                <div className="text-xs text-green-700">minutes</div>
              </div>
              <div className="text-5xl">⏱️</div>
            </div>
          </div>
        </div>

        {/* Learning Activities */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Learning Activities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Flashcard Activity */}
            <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  {flashcardCompleted && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Flashcards</h4>
              <p className="text-sm text-gray-600 mb-4">
                Practice vocabulary with interactive flashcards. Flip cards to see translations and hear pronunciations.
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  {topic.wordCount} cards
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ~{Math.ceil(topic.wordCount / 2)} min
                </div>
              </div>

              <button
                onClick={() => {
                  const url = journeyId 
                    ? `/topics/${id}/flashcards?journeyId=${journeyId}`
                    : `/topics/${id}/flashcards`;
                  navigate(url);
                }}
                className={`
                  w-full px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105
                  ${flashcardCompleted
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                  }
                `}
              >
                {flashcardCompleted ? '✓ Review Again' : '▶ Start Practice'}
              </button>
            </div>

            {/* Quiz Activity */}
            <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Quiz</h4>
              <p className="text-sm text-gray-600 mb-4">
                Test your knowledge with interactive quizzes and earn points!
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{topic.quizCount} questions</span>
                <span>~{Math.ceil(topic.quizCount / 2)} min</span>
              </div>

              <button
                onClick={() => {
                  const url = journeyId 
                    ? `/topics/${id}/quiz?journeyId=${journeyId}`
                    : `/topics/${id}/quiz`;
                  navigate(url);
                }}
                disabled={topic.quizCount === 0}
                className={`
                  w-full px-4 py-3 rounded-lg font-medium transition-colors
                  ${topic.quizCount === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                  }
                `}
              >
                {topic.quizCount === 0 ? 'No Questions Yet' : 'Start Quiz'}
              </button>
            </div>

            {/* Pronunciation Activity - Coming Soon */}
            <div className="bg-white shadow rounded-lg p-6 opacity-60 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                  Coming Soon
                </span>
              </div>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Pronunciation Practice</h4>
              <p className="text-sm text-gray-600 mb-4">
                Practice speaking with AI feedback to perfect your pronunciation.
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{topic.wordCount} words</span>
                <span>~{Math.ceil(topic.wordCount / 1.5)} min</span>
              </div>

              <button
                disabled
                className="w-full px-4 py-3 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>

            {/* Conversation Activity - Coming Soon */}
            <div className="bg-white shadow rounded-lg p-6 opacity-60 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                  Coming Soon
                </span>
              </div>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Conversation Practice</h4>
              <p className="text-sm text-gray-600 mb-4">
                Practice real-world conversations using the vocabulary you've learned.
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Interactive</span>
                <span>~10 min</span>
              </div>

              <button
                disabled
                className="w-full px-4 py-3 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TopicLearner;
