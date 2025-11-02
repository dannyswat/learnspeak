import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { topicService } from '../services/topicService';
import type { Topic } from '../types/topic';
import Layout from '../components/Layout';
import WordsSlideShow from '../components/WordsSlideShow';
import { useAuth } from '../hooks/useAuth';

const TopicDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const isTeacher = user?.roles?.some(role => role === 'teacher' || role === 'admin');

  // Get words with images for navigation
  const wordsWithImages = topic?.words?.filter(word => word.imageUrl) || [];

  // Navigation handlers
  const handlePreviousImage = useCallback(() => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  }, [selectedImageIndex]);

  const handleNextImage = useCallback(() => {
    if (selectedImageIndex !== null && selectedImageIndex < wordsWithImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  }, [selectedImageIndex, wordsWithImages.length]);

  const handleCloseModal = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  const handleImageClick = (wordId: number) => {
    const index = wordsWithImages.findIndex(w => w.id === wordId);
    if (index !== -1) {
      setSelectedImageIndex(index);
    }
  };

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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this topic?')) {
      return;
    }

    try {
      if (id) {
        await topicService.deleteTopic(parseInt(id));
        navigate('/topics');
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to delete topic');
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
            onClick={() => navigate('/topics')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Back to Topics
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
              onClick={() => navigate('/topics')}
              className="hover:text-green-600"
            >
              Topics
            </button>
            <span>›</span>
            <span className="text-gray-900">{topic.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-['Poppins'] mb-2">
                {topic.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
                <span className={`px-3 py-1 rounded-full font-medium ${getLevelBadgeColor(topic.level)}`}>
                  {topic.level}
                </span>
                <span className="text-gray-600 hidden sm:inline">•</span>
                <span className="text-gray-600">{topic.language?.name}</span>
                {topic.createdBy && (
                  <>
                    <span className="text-gray-600 hidden sm:inline">•</span>
                    <span className="text-gray-600 text-xs sm:text-sm">Created by {topic.createdBy.name}</span>
                  </>
                )}
              </div>
            </div>

            {isTeacher && (
              <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                <button
                  onClick={() => navigate(`/topics/${id}/edit`)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {topic.description && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700">{topic.description}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Words</div>
                <div className="text-3xl font-bold text-gray-900">{topic.wordCount}</div>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Quizzes</div>
                <div className="text-3xl font-bold text-gray-900">{topic.quizCount}</div>
              </div>
              <div className="text-4xl">❓</div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Used in Journeys</div>
                <div className="text-3xl font-bold text-gray-900">{topic.usedInJourneys}</div>
              </div>
              <div className="text-4xl">🗺️</div>
            </div>
          </div>
        </div>

        {/* Quiz Management */}
        {isTeacher && (
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Quiz Questions</h3>
                <p className="text-sm text-gray-600">Manage quiz questions for this topic</p>
              </div>
              <button
                onClick={() => navigate(`/topics/${id}/quiz/manage`)}
                className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
              >
                Manage Quiz
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {topic.quizCount} {topic.quizCount === 1 ? 'question' : 'questions'} available
            </div>
          </div>
        )}

        {/* Conversation Management */}
        {isTeacher && (
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Conversations</h3>
                <p className="text-sm text-gray-600">Manage conversation dialogues for this topic</p>
              </div>
              <button
                onClick={() => navigate(`/topics/${id}/conversations/manage`)}
                className="w-full sm:w-auto px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
              >
                💬 Manage Conversations
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Create interactive dialogue scenarios for learners
            </div>
          </div>
        )}

        {/* Words */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="text-lg font-medium text-gray-900">Words in Topic</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => navigate(`/topics/${id}/words/bulk`)}
                className="text-sm px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600"
              >
                ➕ Quick Add Words
              </button>
              <button
                onClick={() => navigate(`/topics/${id}/words/batch-update`)}
                className="text-sm px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                📝 Batch Update
              </button>
              <button
                onClick={() => navigate(`/topics/${id}/edit`)}
                className="text-sm px-3 py-1.5 text-green-600 hover:text-green-700 border border-green-600 hover:bg-green-50 rounded"
              >
                Manage Words
              </button>
            </div>
          </div>

          {topic.words && topic.words.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topic.words.map((word, index) => (
                <div
                  key={word.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-medium text-gray-500">#{index + 1}</div>
                    {word.imageUrl && (
                      <img
                        src={word.imageUrl}
                        alt={word.baseWord}
                        className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleImageClick(word.id)}
                        title="Click to view larger image"
                      />
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="font-semibold text-gray-900 mb-1 text-base sm:text-lg">{word.baseWord}</div>
                    <div className="text-base sm:text-lg text-gray-700">{word.translation}</div>
                    {word.romanization && (
                      <div className="text-sm text-gray-500">{word.romanization}</div>
                    )}
                  </div>

                  {word.audioUrl && (
                    <audio controls className="w-full mt-2">
                      <source src={word.audioUrl} />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No words in this topic yet
            </div>
          )}
        </div>

        {/* Image Modal */}
        <WordsSlideShow
          words={wordsWithImages}
          selectedImageIndex={selectedImageIndex}
          onClose={handleCloseModal}
          onPrevious={handlePreviousImage}
          onNext={handleNextImage}
        />
      </div>
    </Layout>
  );
};

export default TopicDetail;
