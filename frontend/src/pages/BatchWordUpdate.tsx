import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topicService } from '../services/topicService';
import { wordService } from '../services/wordService';
import ttsService from '../services/ttsService';
import Layout from '../components/Layout';
import WordEntryForm, { type WordEntryData } from '../components/WordEntryForm';
import { useLanguages } from '../hooks/useLanguages';

interface WordWithId extends WordEntryData {
  id: number;
}

const BatchWordUpdate: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { languages } = useLanguages();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [topicName, setTopicName] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<number | null>(null);
  const [words, setWords] = useState<WordWithId[]>([]);
  const [originalWords, setOriginalWords] = useState<WordWithId[]>([]);

  useEffect(() => {
    if (topicId) {
      loadTopicWords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  const loadTopicWords = async () => {
    try {
      setLoading(true);
      setError('');

      // Load topic details
      const topic = await topicService.getTopic(parseInt(topicId!), true);
      setTopicName(topic.name);
      
      if (topic.language?.id) {
        setTargetLanguage(topic.language.id);
      }

      // Load all words from the topic
      if (topic.words && topic.words.length > 0) {
        const wordData: WordWithId[] = topic.words.map(word => ({
          id: word.id,
          baseWord: word.baseWord,
          translation: word.translation || '',
          romanization: word.romanization || '',
          notes: '', // TopicWord doesn't have notes field
          imageUrl: word.imageUrl || '',
          audioUrl: word.audioUrl || '',
        }));
        
        setWords(wordData);
        setOriginalWords(JSON.parse(JSON.stringify(wordData))); // Deep copy for comparison
      } else {
        setError('No words found in this topic');
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load topic words');
    } finally {
      setLoading(false);
    }
  };

  const handleWordChange = (index: number, field: keyof WordEntryData, value: string) => {
    const updated = [...words];
    updated[index] = { ...updated[index], [field]: value };
    setWords(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetLanguage) {
      setError('Target language not set');
      return;
    }

    // Find words that have changed
    const changedWords = words.filter((word, index) => {
      const original = originalWords[index];
      return (
        word.baseWord !== original.baseWord ||
        word.translation !== original.translation ||
        word.romanization !== original.romanization ||
        word.notes !== original.notes ||
        word.imageUrl !== original.imageUrl ||
        word.audioUrl !== original.audioUrl
      );
    });

    if (changedWords.length === 0) {
      alert('No changes detected');
      return;
    }
    
    try {
      setSaving(true);
      setError('');

      let successCount = 0;
      const errors: string[] = [];

      for (const word of changedWords) {
        try {
          await wordService.updateWord(word.id, {
            baseWord: word.baseWord,
            imageUrl: word.imageUrl || undefined,
            notes: word.notes || undefined,
            translations: [
              {
                languageId: targetLanguage,
                translation: word.translation,
                romanization: word.romanization || undefined,
                audioUrl: word.audioUrl || undefined,
              },
            ],
          });
          successCount++;
        } catch (err) {
          const error = err as { response?: { data?: { message?: string } } };
          errors.push(`Failed to update "${word.baseWord}": ${error.response?.data?.message || 'Unknown error'}`);
        }
      }

      if (errors.length > 0) {
        setError(`Updated ${successCount} word(s). Errors:\n${errors.join('\n')}`);
      } else {
        alert(`Successfully updated ${successCount} word(s)!`);
        navigate(`/topics/${topicId}`);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update words');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Discard all changes and reset to original values?')) {
      setWords(JSON.parse(JSON.stringify(originalWords)));
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

          // Update the word with audio URL
          const wordIndex = words.findIndex(w => w.id === word.id);
          if (wordIndex !== -1) {
            const updatedWords = [...words];
            updatedWords[wordIndex] = { ...updatedWords[wordIndex], audioUrl: response.audioUrl };
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

  const hasChanges = () => {
    return words.some((word, index) => {
      const original = originalWords[index];
      return (
        word.baseWord !== original.baseWord ||
        word.translation !== original.translation ||
        word.romanization !== original.romanization ||
        word.notes !== original.notes ||
        word.imageUrl !== original.imageUrl ||
        word.audioUrl !== original.audioUrl
      );
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading words...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📝 Batch Update Words
              </h1>
              <p className="mt-2 text-gray-600">
                Topic: <span className="font-semibold">{topicName}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Update multiple words at once. Changes are highlighted.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/topics/${topicId}`)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Back to Topic
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg whitespace-pre-wrap">
            {error}
          </div>
        )}

        {/* Word Entry Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Words to Update ({words.length})
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleBatchGenerateAudio}
                  disabled={generatingAudio || !targetLanguage || saving}
                  className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                      🔊 Batch Generate Audio
                    </>
                  )}
                </button>
                {hasChanges() && (
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={saving}
                    className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↺ Reset Changes
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {words.map((word, index) => (
                <WordEntryForm
                  key={word.id}
                  word={word}
                  index={index}
                  onChange={handleWordChange}
                  languages={languages}
                  targetLanguage={targetLanguage}
                  disabled={saving}
                  showRemoveButton={false}
                  readOnlyBaseWord={false}
                />
              ))}
            </div>

            {words.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No words found in this topic.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {words.length > 0 && (
            <div className="flex justify-end gap-3 mb-8">
              <button
                type="button"
                onClick={() => navigate(`/topics/${topicId}`)}
                disabled={saving}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !hasChanges()}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    💾 Update Words
                    {hasChanges() && ` (${words.filter((w, i) => {
                      const orig = originalWords[i];
                      return w.baseWord !== orig.baseWord || w.translation !== orig.translation || 
                             w.romanization !== orig.romanization || w.notes !== orig.notes ||
                             w.imageUrl !== orig.imageUrl || w.audioUrl !== orig.audioUrl;
                    }).length} changed)`}
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default BatchWordUpdate;
