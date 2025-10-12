import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { journeyService } from '../services/journeyService';
import { userService } from '../services/userService';
import type { Journey } from '../types/journey';
import type { UserJourney } from '../types/user';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

const JourneyDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [userJourney, setUserJourney] = useState<UserJourney | null>(null);
  const [completedTopicIds, setCompletedTopicIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isTeacher = user?.roles?.some(role => role === 'teacher' || role === 'admin');
  const isLearner = user?.roles?.some(role => role === 'learner');

  useEffect(() => {
    if (id) {
      loadJourney(parseInt(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadJourney = async (journeyId: number) => {
    try {
      setLoading(true);
      const data = await journeyService.getJourney(journeyId, true);
      setJourney(data);

      // Load user progress if learner
      if (isLearner && user?.id) {
        try {
          const response = await userService.getUserJourneys(user.id);
          const currentUserJourney = response.userJourneys.find((j: UserJourney) => j.journey?.id === journeyId);
          if (currentUserJourney) {
            setUserJourney(currentUserJourney);
            // Extract completed topic IDs from the journey topics
            // We'll need to track this via nextTopic field
            const completed: number[] = [];
            if (currentUserJourney.nextTopic && data.topics) {
              // All topics before nextTopic in sequence are completed
              const nextTopicSeq = currentUserJourney.nextTopic.sequenceOrder;
              data.topics.forEach(topic => {
                if (topic.sequenceOrder < nextTopicSeq) {
                  completed.push(topic.id);
                }
              });
            } else if (!currentUserJourney.nextTopic && currentUserJourney.status === 'completed') {
              // All topics completed
              completed.push(...(data.topics?.map(t => t.id) || []));
            }
            setCompletedTopicIds(completed);
          }
        } catch (err) {
          console.error('Failed to load user progress:', err);
        }
      }
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

  // Helper function to check if topic is locked for learner
  const isTopicLocked = (topicId: number, _sequenceOrder: number): boolean => {
    if (isTeacher) return false; // Teachers can access all topics
    
    if (completedTopicIds.includes(topicId)) return false; // Completed topics are unlocked
    
    // Check if this is the next topic (first uncompleted in sequence)
    if (userJourney?.nextTopic?.id === topicId) return false;
    
    return true; // All other topics are locked
  };

  // Helper function to check if topic is completed
  const isTopicCompleted = (topicId: number): boolean => {
    return completedTopicIds.includes(topicId);
  };

  // Helper function to check if this is the next topic to complete
  const isNextTopic = (topicId: number): boolean => {
    return userJourney?.nextTopic?.id === topicId;
  };

  // Handle topic click with lock check
  const handleTopicClick = (topicId: number, sequenceOrder: number) => {
    if (isTopicLocked(topicId, sequenceOrder)) {
      return; // Don't navigate if locked
    }
    navigate(`/topics/${topicId}`);
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

            {isTeacher && (
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
            )}
          </div>
        </div>

        {/* Description */}
        {journey.description && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{journey.description}</p>
          </div>
        )}

        {/* Learner Progress Card */}
        {isLearner && userJourney && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow-sm p-6 mb-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {userJourney.completedTopics || 0} of {userJourney.totalTopics || journey.topicCount} topics completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {userJourney.progress || 0}%
                </div>
                <div className={`
                  mt-1 px-3 py-1 rounded-full text-xs font-medium inline-block
                  ${userJourney.status === 'completed' ? 'bg-green-100 text-green-700' :
                    userJourney.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'}
                `}>
                  {userJourney.status === 'in_progress' ? 'In Progress' : 
                   userJourney.status === 'completed' ? 'Completed' : 'Assigned'}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${userJourney.progress || 0}%` }}
              />
            </div>

            {/* Next Topic Info */}
            {userJourney.nextTopic && userJourney.status !== 'completed' && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Next Topic:</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{userJourney.nextTopic.name}</p>
                    {userJourney.nextTopic.description && (
                      <p className="text-sm text-gray-600 mt-1">{userJourney.nextTopic.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/topics/${userJourney.nextTopic!.id}`)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Start Learning
                  </button>
                </div>
              </div>
            )}

            {userJourney.status === 'completed' && (
              <div className="mt-4 pt-4 border-t border-green-200 text-center">
                <div className="flex items-center justify-center text-green-600">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Congratulations! You've completed this journey!</span>
                </div>
              </div>
            )}
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
              {journey.topics.map((topic, index) => {
                const locked = isTopicLocked(topic.id, topic.sequenceOrder);
                const completed = isTopicCompleted(topic.id);
                const isNext = isNextTopic(topic.id);
                
                return (
                  <div
                    key={topic.id}
                    className={`
                      border rounded-lg p-4 transition-all
                      ${locked 
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
                        : completed
                        ? 'border-green-200 bg-green-50 cursor-pointer hover:border-green-300 hover:shadow-sm'
                        : isNext
                        ? 'border-blue-300 bg-blue-50 cursor-pointer hover:border-blue-400 hover:shadow-md ring-2 ring-blue-200'
                        : 'border-gray-200 cursor-pointer hover:border-green-300 hover:shadow-sm'
                      }
                    `}
                    onClick={() => handleTopicClick(topic.id, topic.sequenceOrder)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Topic Number / Status Icon */}
                      <div className={`
                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold
                        ${completed 
                          ? 'bg-green-500 text-white' 
                          : isNext
                          ? 'bg-blue-500 text-white'
                          : locked
                          ? 'bg-gray-300 text-gray-500'
                          : 'bg-green-100 text-green-700'
                        }
                      `}>
                        {completed ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : locked ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-lg font-semibold ${locked ? 'text-gray-500' : 'text-gray-900'}`}>
                                {topic.name}
                              </h4>
                              {isNext && (
                                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
                                  Next
                                </span>
                              )}
                              {locked && (
                                <span className="px-2 py-0.5 bg-gray-400 text-white text-xs rounded-full font-medium">
                                  Locked
                                </span>
                              )}
                            </div>
                            {topic.description && (
                              <p className={`text-sm mt-1 ${locked ? 'text-gray-400' : 'text-gray-600'}`}>
                                {topic.description}
                              </p>
                            )}
                          </div>
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${getLevelBadgeColor(topic.level)}`}>
                            {topic.level}
                          </span>
                        </div>
                        
                        <div className={`flex items-center gap-4 text-sm ${locked ? 'text-gray-400' : 'text-gray-500'}`}>
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

                        {locked && isLearner && (
                          <div className="mt-2 text-xs text-gray-500 italic">
                            Complete previous topics to unlock
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
