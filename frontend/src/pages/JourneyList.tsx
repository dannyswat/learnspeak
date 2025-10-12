import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { journeyService } from '../services/journeyService';
import { wordService } from '../services/wordService';
import type { Journey, JourneyFilterParams } from '../types/journey';
import type { Language } from '../types/word';
import Layout from '../components/Layout';

const JourneyList: React.FC = () => {
  const navigate = useNavigate();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState<Language[]>([]);
  
  // Filter state
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadLanguages();
  }, []);

  useEffect(() => {
    loadJourneys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, selectedLanguage]);

  const loadLanguages = async () => {
    try {
      const langs = await wordService.getLanguages();
      setLanguages(langs);
    } catch (err) {
      console.error('Error loading languages:', err);
    }
  };

  const loadJourneys = async () => {
    try {
      setLoading(true);
      const params: JourneyFilterParams = {
        page,
        pageSize: 12,
      };

      if (search) params.search = search;
      if (selectedLanguage) params.languageCode = selectedLanguage;

      const response = await journeyService.getJourneys(params);
      setJourneys(response.journeys);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err) {
      console.error('Error loading journeys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this journey?')) {
      return;
    }

    try {
      await journeyService.deleteJourney(id);
      loadJourneys();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to delete journey');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-['Poppins']">🗺️ Learning Journeys</h2>
            <p className="mt-1 text-sm text-gray-500">
              Showing {journeys.length} of {total} journeys
            </p>
          </div>
          <button
            onClick={() => navigate('/journeys/new')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + New Journey
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name or description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Journey Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading journeys...</p>
          </div>
        ) : journeys.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">No journeys found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or create a new journey</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journeys.map((journey) => (
              <div
                key={journey.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 font-['Poppins']">
                      {journey.name}
                    </h3>
                    {journey.language && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {journey.language.code.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {journey.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-lg font-bold text-gray-900">{journey.topicCount}</div>
                      <div className="text-xs text-gray-500">Topics</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-lg font-bold text-gray-900">{journey.totalWords}</div>
                      <div className="text-xs text-gray-500">Words</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-lg font-bold text-gray-900">{journey.assignedToCount}</div>
                      <div className="text-xs text-gray-500">Users</div>
                    </div>
                  </div>

                  {journey.createdBy && (
                    <div className="flex items-center mb-4 text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Created by {journey.createdBy.name}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/journeys/${journey.id}`)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/journeys/${journey.id}/edit`)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(journey.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default JourneyList;
