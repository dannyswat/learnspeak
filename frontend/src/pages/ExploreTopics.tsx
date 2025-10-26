import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { topicService } from '../services/topicService';
import { wordService } from '../services/wordService';
import type { Topic, TopicFilterParams } from '../types/topic';
import type { Language } from '../types/word';

const ExploreTopics: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filter state
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    loadLanguages();
  }, []);

  useEffect(() => {
    loadPublicTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, selectedLanguage, selectedLevel]);

  const loadLanguages = async () => {
    try {
      const langs = await wordService.getLanguages();
      setLanguages(langs);
    } catch (err) {
      console.error('Error loading languages:', err);
    }
  };

  const loadPublicTopics = async () => {
    try {
      setLoading(true);
      setError('');

      const params: TopicFilterParams = {
        page,
        pageSize,
        search: search || undefined,
        languageCode: selectedLanguage || undefined,
        level: selectedLevel || undefined,
        isPublic: true,
      };

      const response = await topicService.getPublicTopics(params);
      setTopics(response.topics);
      setTotalPages(response.totalPages);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load public topics');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    setPage(1);
  };

  const handleLevelChange = (value: string) => {
    setSelectedLevel(value);
    setPage(1);
  };

  const handleTopicClick = (topicId: number) => {
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 font-['Poppins']">
            🌍 Explore Public Topics
          </h1>
          <p className="mt-2 text-gray-600">
            Discover and practice with topics created by teachers from around the world
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Topics
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name or description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => handleLevelChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">Loading topics...</div>
          </div>
        ) : (
          <>
            {/* Topics Grid */}
            {topics.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">📭 No public topics found</div>
                <p className="text-gray-400">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => handleTopicClick(topic.id)}
                    className="bg-white shadow rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
                  >
                    {/* Topic Header */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {topic.name}
                      </h3>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getLevelBadgeColor(topic.level)}`}>
                        {topic.level}
                      </span>
                    </div>

                    {/* Description */}
                    {topic.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {topic.description}
                      </p>
                    )}

                    {/* Language */}
                    {topic.language && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span className="mr-1">🌐</span>
                        <span>{topic.language.name}</span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <span className="mr-1">📚</span>
                          {topic.wordCount} words
                        </span>
                        {topic.quizCount > 0 && (
                          <span className="flex items-center">
                            <span className="mr-1">📝</span>
                            {topic.quizCount} quizzes
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Creator */}
                    {topic.createdBy && (
                      <div className="mt-3 text-xs text-gray-500">
                        By {topic.createdBy.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ExploreTopics;
