import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { topicService } from '../services/topicService';
import type { Topic, TopicFilterParams } from '../types/topic';
import Layout from '../components/Layout';
import LanguageSelect from '../components/LanguageSelect';
import { useLanguages } from '../hooks/useLanguages';

const TopicList: React.FC = () => {
  const navigate = useNavigate();
  const { languages } = useLanguages();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<number | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, selectedLevel, selectedLanguage]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const params: TopicFilterParams = {
        page,
        pageSize: 12,
      };

      if (search) params.search = search;
      if (selectedLevel) params.level = selectedLevel;
      if (selectedLanguage) {
        const lang = languages.find(l => l.id === selectedLanguage);
        if (lang) params.languageCode = lang.code;
      }

      const response = await topicService.getTopics(params);
      setTopics(response.topics);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err) {
      console.error('Error loading topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) {
      return;
    }

    try {
      await topicService.deleteTopic(id);
      loadTopics();
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-['Poppins']">📚 Topics</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage learning topics and their word collections
            </p>
          </div>
          <button
            onClick={() => navigate('/topics/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            ➕ Create Topic
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search topics..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Language Filter */}
            <LanguageSelect
              value={selectedLanguage}
              onChange={(langId) => {
                setSelectedLanguage(langId);
                setPage(1);
              }}
              languages={languages}
              placeholder="All Languages"
              showLabel={false}
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {topics.length} of {total} topics
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading topics...</div>
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-500">No topics found</div>
            <button
              onClick={() => navigate('/topics/new')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-green-600 hover:text-green-500"
            >
              Create your first topic
            </button>
          </div>
        ) : (
          <>
            {/* Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {topic.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(topic.level)}`}>
                            {topic.level}
                          </span>
                          <span>•</span>
                          <span>{topic.language?.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {topic.description || 'No description'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <span>📝</span>
                        <span>{topic.wordCount} words</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>💬</span>
                        <span>{topic.conversationCount} conversations</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>❓</span>
                        <span>{topic.quizCount} quizzes</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/topics/${topic.id}`)}
                        className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/topics/${topic.id}/edit`)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(topic.id)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Creator */}
                    {topic.createdBy && (
                      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                        Created by {topic.createdBy.name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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

export default TopicList;
