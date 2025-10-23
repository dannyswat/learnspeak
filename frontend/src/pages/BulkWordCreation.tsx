import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topicService } from '../services/topicService';
import { wordService, uploadService } from '../services/wordService';
import translationService from '../services/translationService';
import ttsService from '../services/ttsService';
import Layout from '../components/Layout';
import LanguageSelect from '../components/LanguageSelect';
import WordEntryForm, { type WordEntryData } from '../components/WordEntryForm';
import { useLanguages } from '../hooks/useLanguages';

const BulkWordCreation: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { languages } = useLanguages();

  const [wordCount, setWordCount] = useState<number>(5);
  const [targetLanguage, setTargetLanguage] = useState<number | null>(null);
  const [topicName, setTopicName] = useState<string>('');
  const [words, setWords] = useState<WordEntryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [translating, setTranslating] = useState(false);
  const [generatingAudio, setGeneratingAudio] = useState(false);

  useEffect(() => {
    // Auto-select first language if available
    if (languages.length > 0 && !targetLanguage) {
      setTargetLanguage(languages[0].id);
    }
  }, [languages, targetLanguage]);

  useEffect(() => {
    if (topicId) {
      loadTopic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  useEffect(() => {
    // Initialize words array when count changes
    const newWords = Array.from({ length: wordCount }, (_, i) => 
      words[i] || { baseWord: '', translation: '', romanization: '', notes: '', imageUrl: '', audioUrl: '' }
    );
    setWords(newWords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordCount]);

  const loadTopic = async () => {
    try {
      setLoading(true);
      const data = await topicService.getTopic(parseInt(topicId!), false);
      setTopicName(data.name);
      if (data.language?.id) {
        setTargetLanguage(data.language.id);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load topic');
    } finally {
      setLoading(false);
    }
  };

  const handleWordChange = (index: number, field: keyof WordEntryData, value: string) => {
    const newWords = [...words];
    newWords[index] = { ...newWords[index], [field]: value };
    setWords(newWords);
  };

  const handleBatchTranslate = async () => {
    if (!targetLanguage) {
      alert('Please select a target language first');
      return;
    }

    // Get all base words that don't have translations yet
    const wordsToTranslate = words.filter(w => w.baseWord.trim() !== '' && w.translation.trim() === '');
    
    if (wordsToTranslate.length === 0) {
      alert('All words already have translations or no words to translate');
      return;
    }

    if (!confirm(`Translate ${wordsToTranslate.length} words using AI? This will use Azure Translator API.`)) {
      return;
    }

    try {
      setTranslating(true);
      const language = languages.find(l => l.id === targetLanguage);
      
      const response = await translationService.translateBatch({
        texts: wordsToTranslate.map(w => w.baseWord),
        fromLang: 'en',
        toLang: language?.code || 'zh-Hant',
      });

      // Update translations
      let translationIndex = 0;
      const updatedWords = words.map(word => {
        if (word.baseWord.trim() !== '' && word.translation.trim() === '') {
          const result = response.results[translationIndex];
          translationIndex++;
          return {
            ...word,
            translation: result?.translation || word.translation,
          };
        }
        return word;
      });

      setWords(updatedWords);
      alert(`Successfully translated ${response.results.length} words! (${response.cached} from cache)`);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || 'Failed to translate words');
    } finally {
      setTranslating(false);
    }
  };

  const handleBatchGenerateAudio = async () => {
    if (!targetLanguage) {
      alert('Please select a target language first');
      return;
    }

    // Get all words with translations but no audio
    const wordsNeedingAudio = words.filter(w => w.translation.trim() !== '' && !w.audioUrl);
    
    if (wordsNeedingAudio.length === 0) {
      alert('All words with translations already have audio or no translations available');
      return;
    }

    if (!confirm(`Generate audio for ${wordsNeedingAudio.length} words using Azure TTS?`)) {
      return;
    }

    try {
      setGeneratingAudio(true);
      const language = languages.find(l => l.id === targetLanguage);
      
      let successCount = 0;
      const errors: string[] = [];

      // Generate audio for each word
      for (const word of wordsNeedingAudio) {
        try {
          const response = await ttsService.generateAudio({
            text: word.translation,
            language: language?.code,
          });

          // Update the word with audio URL (with cache buster)
          const wordIndex = words.findIndex(w => w === word);
          if (wordIndex !== -1) {
            const updatedWords = [...words];
            updatedWords[wordIndex] = { 
              ...updatedWords[wordIndex], 
              audioUrl: uploadService.addCacheBuster(response.audioUrl) 
            };
            setWords(updatedWords);
          }
          
          successCount++;
        } catch (err) {
          const error = err as { response?: { data?: { error?: string } } };
          errors.push(`"${word.translation}": ${error.response?.data?.error || 'Failed'}`);
        }
      }

      if (errors.length > 0) {
        alert(`Generated audio for ${successCount}/${wordsNeedingAudio.length} words.\n\nFailed:\n${errors.join('\n')}`);
      } else {
        alert(`Successfully generated audio for ${successCount} words!`);
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || 'Failed to generate audio');
    } finally {
      setGeneratingAudio(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetLanguage) {
      alert('Please select a target language');
      return;
    }

    // Filter out empty words
    const validWords = words.filter(w => w.baseWord.trim() !== '' && w.translation.trim() !== '');

    if (validWords.length === 0) {
      alert('Please add at least one word with both English and translation');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const createdWordIds: number[] = [];

      // Create words one by one
      for (const word of validWords) {
        const wordData = {
          baseWord: word.baseWord.trim(),
          imageUrl: word.imageUrl || undefined,
          notes: word.notes.trim() || undefined,
          translations: [
            {
              languageId: targetLanguage,
              translation: word.translation.trim(),
              romanization: word.romanization.trim() || undefined,
              audioUrl: word.audioUrl || undefined,
            }
          ]
        };

        const createdWord = await wordService.createWord(wordData);
        createdWordIds.push(createdWord.id);
      }

      // Add all words to the topic
      if (topicId && createdWordIds.length > 0) {
        await topicService.addWordsToTopic(parseInt(topicId), createdWordIds);
      }

      alert(`Successfully created ${createdWordIds.length} words and added them to the topic!`);
      navigate(`/topics/${topicId}`);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create words');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/topics/${topicId}`);
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value);
    if (count > 0 && count <= 100) {
      setWordCount(count);
    }
  };

  const addMoreWords = () => {
    if (wordCount < 100) {
      setWordCount(wordCount + 5);
    }
  };

  const removeWord = (index: number) => {
    const newWords = words.filter((_, i) => i !== index);
    setWords(newWords);
    setWordCount(Math.max(1, wordCount - 1));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <button onClick={() => navigate('/topics')} className="hover:text-green-600">
              Topics
            </button>
            <span>›</span>
            <button onClick={() => navigate(`/topics/${topicId}`)} className="hover:text-green-600">
              {topicName || 'Topic'}
            </button>
            <span>›</span>
            <span className="text-gray-900">Quick Add Words</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Quick Add Words</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Quickly create multiple words and add them to "{topicName}" in one go
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Configuration */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Setup</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How many words do you want to add?
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={wordCount}
                  onChange={handleCountChange}
                  className="w-20 sm:w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="text-xs sm:text-sm text-gray-600">words (max 100)</span>
              </div>
            </div>

            <LanguageSelect
              label="Target Language"
              value={targetLanguage}
              onChange={setTargetLanguage}
              languages={languages}
              required={true}
            />
          </div>
        </div>

        {/* Word Entry Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold">Enter Words</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleBatchTranslate}
                  disabled={translating || !targetLanguage}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {translating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Translating...
                    </>
                  ) : (
                    <>
                      🤖 AI Translate
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleBatchGenerateAudio}
                  disabled={generatingAudio || !targetLanguage}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generatingAudio ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      🔊 <span className="hidden sm:inline">Batch Generate Audio</span><span className="sm:hidden">Audio</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={addMoreWords}
                  disabled={wordCount >= 100}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Add 5 More
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {words.map((word, index) => (
                <WordEntryForm
                  key={index}
                  word={word}
                  index={index}
                  onChange={handleWordChange}
                  onRemove={removeWord}
                  languages={languages}
                  targetLanguage={targetLanguage}
                  disabled={saving}
                  showRemoveButton={true}
                  readOnlyBaseWord={false}
                />
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              * Required fields. Empty entries will be skipped.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-stretch gap-3 bg-white shadow rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center sm:justify-end">
              <div className="text-xs sm:text-sm text-gray-600 self-center text-center sm:text-left">
                {words.filter(w => w.baseWord.trim() && w.translation.trim()).length} valid entries
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 text-sm sm:text-base bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Creating Words...' : `Create & Add Words`}
              </button>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto sm:self-center px-4 sm:px-6 py-3 text-sm sm:text-base bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default BulkWordCreation;
