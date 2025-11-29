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
import { useInvalidateWordsAndTopic } from '../hooks/useWord';
import { useAutoPlay } from '../hooks/useAutoPlay';
import { useAutoSave } from '../hooks/useAutoSave';
import { useDebounce } from '../hooks/useDebounce';
import type { Word, Translation } from '../types/word';

interface WordEntryDataWithId extends WordEntryData {
  existingWordId?: number;
}

interface BulkWordFormData {
  words: WordEntryDataWithId[];
  wordCount: number;
  targetLanguage: number | null;
}

const BulkWordCreation: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { languages } = useLanguages();
  const invalidateWordsAndTopic = useInvalidateWordsAndTopic();
  const topicIdNum = topicId ? parseInt(topicId) : 0;
  
  // Form state with auto-save
  const { 
    data: formData, 
    setData: setFormData, 
    isLoading: isAutoSaveLoading,
    lastSaved: lastAutoSaved,
    clearSaved: clearAutoSaved 
  } = useAutoSave<BulkWordFormData>(
    `bulkWordCreation_${topicId || 'new'}`,
    { words: [], wordCount: 5, targetLanguage: null },
    { debounceMs: 500 }
  );

  // Derive state from formData for easier access
  const words = formData.words;
  const wordCount = formData.wordCount;
  const targetLanguage = formData.targetLanguage;

  // Helper functions to update form data
  const setWords = (newWords: WordEntryDataWithId[] | ((prev: WordEntryDataWithId[]) => WordEntryDataWithId[])) => {
    setFormData(prev => ({
      ...prev,
      words: typeof newWords === 'function' ? newWords(prev.words) : newWords
    }));
  };

  const setWordCount = (newCount: number | ((prev: number) => number)) => {
    setFormData(prev => ({
      ...prev,
      wordCount: typeof newCount === 'function' ? newCount(prev.wordCount) : newCount
    }));
  };

  const setTargetLanguage = (newLang: number | null) => {
    setFormData(prev => ({
      ...prev,
      targetLanguage: newLang
    }));
  };

  const [topicName, setTopicName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [translating, setTranslating] = useState(false);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  
  // Auto play functionality
  const { autoPlaying, currentPlayingIndex, play: playAudio, stop: stopAudio } = useAutoPlay();

  // Debounced check for existing word
  const debouncedCheckExistingWord = useDebounce((baseWord: string, index: number) => {
    checkExistingWord(baseWord, index);
  }, 500);

  useEffect(() => {
    // Auto-select first language if available
    if (languages.length > 0 && !targetLanguage) {
      setTargetLanguage(languages[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languages]);

  useEffect(() => {
    if (topicId) {
      loadTopic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  useEffect(() => {
    // Initialize words array when count changes
    // Only run after auto-save data is loaded
    if (!isAutoSaveLoading && wordCount !== words.length) {
      const newWords = Array.from({ length: wordCount }, (_, i) => 
        words[i] || { baseWord: '', translation: '', romanization: '', notes: '', imageUrl: '', audioUrl: '', existingWordId: undefined }
      );
      setWords(newWords);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordCount, isAutoSaveLoading]);

  const checkExistingWord = async (baseWord: string, index: number) => {
    if (!baseWord.trim()) return;

    try {
      // Search for exact match
      const result = await wordService.getWords({ search: baseWord.trim(), pageSize: 10 });
      
      // Find exact match (case-insensitive)
      const exactMatch = result.words.find(
        (w: Word) => w.baseWord.toLowerCase() === baseWord.trim().toLowerCase()
      );

      const newWords = [...words];
      if (exactMatch) {
        // Update the word entry with existing data
        newWords[index] = {
          ...newWords[index],
          baseWord: exactMatch.baseWord, // Use exact casing from database
          imageUrl: exactMatch.imageUrl || newWords[index].imageUrl,
          notes: exactMatch.notes || newWords[index].notes,
          existingWordId: exactMatch.id,
        };
        setWords(newWords);
      } else {
        if (newWords[index].existingWordId) {
          // Clear existingWordId if no match found
          newWords[index] = {
            ...newWords[index],
            existingWordId: undefined,
          };
          setWords(newWords);
        }
      }
      
    } catch (err) {
      console.error('Error checking existing word:', err);
      // Don't show error to user, just continue
    }
  };

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

    // Check for existing word when base word is changed (debounced)
    if (field === 'baseWord' && value.trim()) {
      debouncedCheckExistingWord(value, index);
    }
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
      const updatedWords = [...words]; // Create a single copy to accumulate updates

      // Generate audio for each word
      for (const word of wordsNeedingAudio) {
        try {
          const response = await ttsService.generateAudio({
            text: word.translation,
            language: language?.code,
          });

          // Update the word with audio URL (with cache buster)
          const wordIndex = updatedWords.findIndex(w => w === word);
          if (wordIndex !== -1) {
            updatedWords[wordIndex] = { 
              ...updatedWords[wordIndex], 
              audioUrl: uploadService.addCacheBuster(response.audioUrl) 
            };
          }
          
          successCount++;
        } catch (err) {
          const error = err as { response?: { data?: { error?: string } } };
          errors.push(`"${word.translation}": ${error.response?.data?.error || 'Failed'}`);
        }
      }

      // Set the updated words state once after all generations
      setWords(updatedWords);

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

  const handleAutoPlay = () => playAudio(words);
  const handleStopAutoPlay = () => stopAudio();

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

      // Process each word: create new or update existing
      for (const word of validWords) {
        let wordId: number;

        if (word.existingWordId) {
          // Word exists - update it with new translation
          try {
            // First, get the existing word to check if translation already exists
            const existingWord = await wordService.getWord(word.existingWordId);
            
            // Check if this language translation already exists
            const existingTranslation = existingWord.translations?.find(
              (t: Translation) => t.languageId === targetLanguage
            );

            if (existingTranslation) {
              // Translation exists, update it
              const updatedTranslations = existingWord.translations!.map((t: Translation) =>
                t.languageId === targetLanguage
                  ? {
                      languageId: targetLanguage,
                      translation: word.translation.trim(),
                      romanization: word.romanization.trim() || undefined,
                      audioUrl: word.audioUrl || t.audioUrl || undefined,
                    }
                  : t
              );

              await wordService.updateWord(word.existingWordId, {
                baseWord: word.baseWord.trim(),
                imageUrl: word.imageUrl || existingWord.imageUrl || undefined,
                notes: word.notes.trim() || existingWord.notes || undefined,
                translations: updatedTranslations,
              });
            } else {
              // Translation doesn't exist, add it
              await wordService.updateWord(word.existingWordId, {
                baseWord: word.baseWord.trim(),
                imageUrl: word.imageUrl || existingWord.imageUrl || undefined,
                notes: word.notes.trim() || existingWord.notes || undefined,
                translations: [
                  ...(existingWord.translations || []),
                  {
                    languageId: targetLanguage,
                    translation: word.translation.trim(),
                    romanization: word.romanization.trim() || undefined,
                    audioUrl: word.audioUrl || undefined,
                  }
                ],
              });
            }

            wordId = word.existingWordId;
          } catch (err) {
            console.error('Error updating existing word:', err);
            throw err;
          }
        } else {
          // Create new word
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
          wordId = createdWord.id;
        }

        createdWordIds.push(wordId);
      }

      // Add all words to the topic
      if (topicId && createdWordIds.length > 0) {
        await topicService.addWordsToTopic(parseInt(topicId), createdWordIds);
      }

      const newWordsCount = validWords.filter((w: WordEntryDataWithId) => !w.existingWordId).length;
      const updatedWordsCount = validWords.filter((w: WordEntryDataWithId) => w.existingWordId).length;
      
      let successMessage = '';
      if (newWordsCount > 0 && updatedWordsCount > 0) {
        successMessage = `Successfully created ${newWordsCount} new word(s) and updated ${updatedWordsCount} existing word(s)!`;
      } else if (newWordsCount > 0) {
        successMessage = `Successfully created ${newWordsCount} word(s)!`;
      } else {
        successMessage = `Successfully updated ${updatedWordsCount} word(s)!`;
      }

      // Invalidate relevant queries
      invalidateWordsAndTopic(topicIdNum);

      // Clear auto-saved data
      clearAutoSaved();

      alert(successMessage);
      navigate(`/topics/${topicId}`);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create words');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Clear auto-saved data on cancel
    clearAutoSaved();
    navigate(`/topics/${topicId}`);
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

  if (loading || isAutoSaveLoading) {
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Quick Add Words</h2>
              <p className="text-sm sm:text-base text-gray-600">
                Quickly create multiple words and add them to "{topicName}" in one go
              </p>
            </div>
            {lastAutoSaved && (
              <div className="text-xs text-gray-500">
                Auto-saved at {lastAutoSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
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
              <div className="flex items-center gap-2">
                <span className="text-xl text-gray-900 px-4 border-b-2 border-gray-500">{wordCount}</span>
                <button
                  type="button"
                  onClick={() => setWordCount(Math.min(100, wordCount + 1))}
                  disabled={wordCount >= 100}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  + Add
                </button>
                <button
                  type="button"
                  onClick={addMoreWords}
                  disabled={wordCount >= 100}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  + Add 5
                </button>
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
                {autoPlaying ? (
                  <button
                    type="button"
                    onClick={handleStopAutoPlay}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                  >
                    ⏹️ Stop
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAutoPlay}
                    disabled={words.filter(w => w.audioUrl).length === 0}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    ▶️ <span className="hidden sm:inline">Autoplay</span><span className="sm:hidden">Play</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {words.map((word, index) => (
                <div
                  key={index}
                  className={`transition-all ${
                    currentPlayingIndex === index
                      ? 'ring-4 ring-teal-400 ring-opacity-50 shadow-lg'
                      : word.existingWordId
                      ? 'ring-2 ring-blue-400 ring-opacity-50'
                      : ''
                  }`}
                >
                  {word.existingWordId && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 px-4 py-2 mb-2 text-sm text-blue-700">
                      ℹ️ Existing word found. Image and notes loaded. Translation will be added/updated.
                    </div>
                  )}
                  <WordEntryForm
                    word={word}
                    index={index}
                    onChange={handleWordChange}
                    onRemove={removeWord}
                    languages={languages}
                    targetLanguage={targetLanguage}
                    disabled={saving}
                    showRemoveButton={true}
                    readOnlyBaseWord={false}
                    totalWords={words.length}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              * Required fields. Empty entries will be skipped.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            {/* Desktop: Both buttons side by side */}
            <div className="hidden sm:flex sm:items-center sm:justify-between">
              <div className="text-xs sm:text-sm text-gray-600">
                {words.filter(w => w.baseWord.trim() && w.translation.trim()).length} valid entries
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 sm:px-6 py-3 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 sm:px-6 py-3 text-sm sm:text-base bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Creating Words...' : `Create & Add Words`}
                </button>
              </div>
            </div>

            {/* Mobile: Submit button first, then cancel button below */}
            <div className="flex flex-col gap-3 sm:hidden">
              <div className="text-xs text-gray-600 text-center">
                {words.filter(w => w.baseWord.trim() && w.translation.trim()).length} valid entries
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-3 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Creating Words...' : `Create & Add Words`}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default BulkWordCreation;
