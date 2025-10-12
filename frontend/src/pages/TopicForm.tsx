import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { topicService } from '../services/topicService';
import { wordService } from '../services/wordService';
import type { CreateTopicRequest, UpdateTopicRequest } from '../types/topic';
import type { Language, Word } from '../types/word';
import Layout from '../components/Layout';

const TopicForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [availableWords, setAvailableWords] = useState<Word[]>([]);
  const [selectedWords, setSelectedWords] = useState<Word[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [languageCode, setLanguageCode] = useState('');

  // Word selection
  const [wordSearch, setWordSearch] = useState('');

  useEffect(() => {
    loadLanguages();
    loadWords();
    if (isEditMode && id) {
      loadTopic(parseInt(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (wordSearch) {
      loadWords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordSearch]);

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

  const loadWords = async () => {
    try {
      const response = await wordService.getWords({
        page: 1,
        pageSize: 100,
        search: wordSearch,
      });
      setAvailableWords(response.words);
    } catch (err) {
      console.error('Error loading words:', err);
    }
  };

  const loadTopic = async (topicId: number) => {
    try {
      setLoading(true);
      const topic = await topicService.getTopic(topicId, true);

      setName(topic.name);
      setDescription(topic.description);
      setLevel(topic.level);
      setLanguageCode(topic.language?.code || '');

      // Load selected words
      if (topic.words && topic.words.length > 0) {
        const wordIds = topic.words.map(w => w.id);
        const wordsResponse = await wordService.getWords({
          page: 1,
          pageSize: 100,
        });
        const topicWords = wordsResponse.words.filter(w => wordIds.includes(w.id));
        setSelectedWords(topicWords);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load topic');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Topic name is required');
      return;
    }

    if (!languageCode) {
      setError('Please select a language');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const wordIds = selectedWords.map(w => w.id);

      if (isEditMode && id) {
        const request: UpdateTopicRequest = {
          name,
          description,
          level,
          languageCode,
          wordIds,
        };
        await topicService.updateTopic(parseInt(id), request);
      } else {
        const request: CreateTopicRequest = {
          name,
          description,
          level,
          languageCode,
          wordIds,
        };
        await topicService.createTopic(request);
      }

      navigate('/topics');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} topic`);
    } finally {
      setLoading(false);
    }
  };

  const addWord = (word: Word) => {
    if (!selectedWords.find(w => w.id === word.id)) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const removeWord = (wordId: number) => {
    setSelectedWords(selectedWords.filter(w => w.id !== wordId));
  };

  const moveWordUp = (index: number) => {
    if (index === 0) return;
    const newWords = [...selectedWords];
    [newWords[index - 1], newWords[index]] = [newWords[index], newWords[index - 1]];
    setSelectedWords(newWords);
  };

  const moveWordDown = (index: number) => {
    if (index === selectedWords.length - 1) return;
    const newWords = [...selectedWords];
    [newWords[index], newWords[index + 1]] = [newWords[index + 1], newWords[index]];
    setSelectedWords(newWords);
  };

  if (loading && isEditMode) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading topic...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900 font-['Poppins']">
            {isEditMode ? '✏️ Edit Topic' : '➕ Create New Topic'}
          </h2>
          <button
            type="button"
            onClick={() => navigate('/topics')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Topic Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Level and Language */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Level *
                      </label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language *
                      </label>
                      <select
                        value={languageCode}
                        onChange={(e) => setLanguageCode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">Select Language</option>
                        {languages.map((lang) => (
                          <option key={lang.id} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Words */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Selected Words ({selectedWords.length})
                </h3>

                {selectedWords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No words selected. Add words from the panel on the right.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedWords.map((word, index) => (
                      <div
                        key={word.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-gray-500 text-sm font-medium">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{word.baseWord}</div>
                            {word.translations && word.translations.length > 0 && (
                              <div className="text-sm text-gray-600">
                                {word.translations[0].translation}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveWordUp(index)}
                            disabled={index === 0}
                            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ⬆️
                          </button>
                          <button
                            type="button"
                            onClick={() => moveWordDown(index)}
                            disabled={index === selectedWords.length - 1}
                            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ⬇️
                          </button>
                          <button
                            type="button"
                            onClick={() => removeWord(word.id)}
                            className="p-1 text-red-600 hover:text-red-900"
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/topics')}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Saving...' : isEditMode ? 'Update Topic' : 'Create Topic'}
                </button>
              </div>
            </div>

            {/* Right Column - Word Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6 sticky top-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Words</h3>

                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search words..."
                    value={wordSearch}
                    onChange={(e) => setWordSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Available Words */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {availableWords
                    .filter(word => !selectedWords.find(w => w.id === word.id))
                    .map((word) => (
                      <div
                        key={word.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => addWord(word)}
                      >
                        <div className="font-medium text-gray-900">{word.baseWord}</div>
                        {word.translations && word.translations.length > 0 && (
                          <div className="text-sm text-gray-600">
                            {word.translations[0].translation}
                          </div>
                        )}
                      </div>
                    ))}

                  {availableWords.filter(word => !selectedWords.find(w => w.id === word.id)).length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No available words
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TopicForm;
