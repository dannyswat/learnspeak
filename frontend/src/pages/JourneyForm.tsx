import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { journeyService } from '../services/journeyService';
import { topicService } from '../services/topicService';
import { wordService } from '../services/wordService';
import type { CreateJourneyRequest, UpdateJourneyRequest } from '../types/journey';
import type { Topic } from '../types/topic';
import type { Language } from '../types/word';
import Layout from '../components/Layout';

const JourneyForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [languageCode, setLanguageCode] = useState('');

  // Topic selection
  const [topicSearch, setTopicSearch] = useState('');

  useEffect(() => {
    loadLanguages();
    if (isEditMode && id) {
      loadJourney(parseInt(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (languageCode) {
      loadTopics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageCode, topicSearch]);

  const loadLanguages = async () => {
    try {
      const langs = await wordService.getLanguages();
      setLanguages(langs);
      if (!isEditMode && langs.length > 0) {
        setLanguageCode(langs[0].code);
      }
    } catch (err) {
      console.error('Error loading languages:', err);
    }
  };

  const loadTopics = async () => {
    try {
      const response = await topicService.getTopics({
        page: 1,
        pageSize: 100,
        search: topicSearch,
        languageCode,
      });
      setAvailableTopics(response.topics);
    } catch (err) {
      console.error('Error loading topics:', err);
    }
  };

  const loadJourney = async (journeyId: number) => {
    try {
      setLoading(true);
      const journey = await journeyService.getJourney(journeyId, true);

      setName(journey.name);
      setDescription(journey.description);
      setLanguageCode(journey.language?.code || '');

      // Load selected topics
      if (journey.topics && journey.topics.length > 0) {
        const topicIds = journey.topics.map(t => t.id);
        const topicsResponse = await topicService.getTopics({
          page: 1,
          pageSize: 100,
          languageCode: journey.language?.code,
        });
        const journeyTopics = topicsResponse.topics.filter(t => topicIds.includes(t.id));
        
        // Sort by sequence order
        const sortedTopics = journeyTopics.sort((a, b) => {
          const aOrder = journey.topics!.find(jt => jt.id === a.id)?.sequenceOrder || 0;
          const bOrder = journey.topics!.find(jt => jt.id === b.id)?.sequenceOrder || 0;
          return aOrder - bOrder;
        });
        
        setSelectedTopics(sortedTopics);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load journey');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Journey name is required');
      return;
    }

    if (!languageCode) {
      setError('Please select a language');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const topicIds = selectedTopics.map(t => t.id);

      if (isEditMode && id) {
        const request: UpdateJourneyRequest = {
          name,
          description,
          languageCode,
          topicIds,
        };
        await journeyService.updateJourney(parseInt(id), request);
      } else {
        const request: CreateJourneyRequest = {
          name,
          description,
          languageCode,
          topicIds,
        };
        await journeyService.createJourney(request);
      }

      navigate('/journeys');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} journey`);
    } finally {
      setLoading(false);
    }
  };

  const addTopic = (topic: Topic) => {
    if (!selectedTopics.find(t => t.id === topic.id)) {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const removeTopic = (topicId: number) => {
    setSelectedTopics(selectedTopics.filter(t => t.id !== topicId));
  };

  const moveTopicUp = (index: number) => {
    if (index > 0) {
      const newTopics = [...selectedTopics];
      [newTopics[index - 1], newTopics[index]] = [newTopics[index], newTopics[index - 1]];
      setSelectedTopics(newTopics);
    }
  };

  const moveTopicDown = (index: number) => {
    if (index < selectedTopics.length - 1) {
      const newTopics = [...selectedTopics];
      [newTopics[index], newTopics[index + 1]] = [newTopics[index + 1], newTopics[index]];
      setSelectedTopics(newTopics);
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

  if (loading && isEditMode) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading journey...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/journeys')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Journeys
          </button>
          <h2 className="text-3xl font-bold text-gray-900 font-['Poppins']">
            {isEditMode ? 'Edit Journey' : 'Create New Journey'}
          </h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Spanish for Beginners"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe the learning journey and what students will achieve..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language <span className="text-red-500">*</span>
                </label>
                <select
                  value={languageCode}
                  onChange={(e) => {
                    setLanguageCode(e.target.value);
                    setSelectedTopics([]);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a language</option>
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Topic Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Topics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Available Topics */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Available Topics</h4>
                <input
                  type="text"
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  placeholder="Search topics..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3"
                />
                <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                  {languageCode ? (
                    availableTopics.length > 0 ? (
                      availableTopics
                        .filter(topic => !selectedTopics.find(t => t.id === topic.id))
                        .map((topic) => (
                          <div
                            key={topic.id}
                            onClick={() => addTopic(topic)}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {topic.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {topic.wordCount} words
                                </p>
                              </div>
                              <span className={`ml-2 px-2 py-1 text-xs rounded ${getLevelBadgeColor(topic.level)}`}>
                                {topic.level}
                              </span>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No topics available
                      </div>
                    )
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Select a language first
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Topics */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Selected Topics ({selectedTopics.length})
                </h4>
                <div className="border border-gray-200 rounded-lg max-h-[28rem] overflow-y-auto">
                  {selectedTopics.length > 0 ? (
                    selectedTopics.map((topic, index) => (
                      <div
                        key={topic.id}
                        className="p-3 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => moveTopicUp(index)}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => moveTopicDown(index)}
                              disabled={index === selectedTopics.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {topic.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-xs rounded ${getLevelBadgeColor(topic.level)}`}>
                                {topic.level}
                              </span>
                              <span className="text-xs text-gray-500">
                                {topic.wordCount} words
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTopic(topic.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                            title="Remove"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No topics selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/journeys')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Journey' : 'Create Journey'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default JourneyForm;
