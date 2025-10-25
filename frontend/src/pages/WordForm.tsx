import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { wordService } from '../services/wordService';
import type { CreateWordRequest, UpdateWordRequest, CreateTranslationInput, UpdateTranslationInput } from '../types/word';
import Layout from '../components/Layout';
import ImageInput from '../components/ImageInput';
import AudioInput from '../components/AudioInput';
import LanguageSelect from '../components/LanguageSelect';
import { useLanguages } from '../hooks/useLanguages';

const WordForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { languages } = useLanguages();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [baseWord, setBaseWord] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [translations, setTranslations] = useState<(CreateTranslationInput | UpdateTranslationInput)[]>([
    { languageId: 0, translation: '', romanization: '', audioUrl: '' }
  ]);

  useEffect(() => {
    if (isEditMode && id) {
      loadWord(parseInt(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // If creating a new word, prefill with preferred language
    if (!isEditMode && languages.length > 0 && translations.length === 1 && translations[0].languageId === 0) {
      const preferredLanguageId = localStorage.getItem('preferredLanguageId');
      if (preferredLanguageId) {
        const langId = parseInt(preferredLanguageId);
        if (languages.find(l => l.id === langId)) {
          updateTranslation(0, 'languageId', langId);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languages, isEditMode]);

  const loadWord = async (wordId: number) => {
    try {
      setLoading(true);
      const word = await wordService.getWord(wordId);
      
      setBaseWord(word.baseWord);
      setImageUrl(word.imageUrl || '');
      setNotes(word.notes || '');
      
      if (word.translations.length > 0) {
        setTranslations(word.translations.map(t => ({
          id: t.id,
          languageId: t.languageId,
          translation: t.translation,
          romanization: t.romanization || '',
          audioUrl: t.audioUrl || '',
        })));
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load word');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!baseWord.trim()) {
      setError('Base word is required');
      return;
    }

    const validTranslations = translations.filter(t => t.languageId > 0 && t.translation.trim());
    if (validTranslations.length === 0) {
      setError('At least one translation is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (isEditMode && id) {
        // Update word
        const request: UpdateWordRequest = {
          baseWord,
          imageUrl: imageUrl || undefined,
          notes: notes || undefined,
          translations: validTranslations as UpdateTranslationInput[],
        };
        await wordService.updateWord(parseInt(id), request);
      } else {
        // Create word
        const request: CreateWordRequest = {
          baseWord,
          imageUrl: imageUrl || undefined,
          notes: notes || undefined,
          translations: validTranslations as CreateTranslationInput[],
        };
        await wordService.createWord(request);
      }

      navigate('/words');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} word`);
    } finally {
      setLoading(false);
    }
  };

  const addTranslation = () => {
    setTranslations([...translations, { languageId: 0, translation: '', romanization: '', audioUrl: '' }]);
  };

  const removeTranslation = (index: number) => {
    setTranslations(translations.filter((_, i) => i !== index));
  };

  const updateTranslation = (index: number, field: keyof CreateTranslationInput, value: string | number) => {
    const updated = [...translations];
    updated[index] = { ...updated[index], [field]: value };
    setTranslations(updated);
    
    // Save language preference to localStorage when language is selected
    if (field === 'languageId' && typeof value === 'number' && value > 0) {
      localStorage.setItem('preferredLanguageId', value.toString());
    }
  };

  if (loading && isEditMode) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading word...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold text-gray-900 font-['Poppins']">
              {isEditMode ? '✏️ Edit Word' : '➕ Create New Word'}
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/words')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  The base word and general information.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="space-y-4">
                  {/* Base Word */}
                  <div>
                    <label htmlFor="baseWord" className="block text-sm font-medium text-gray-700">
                      Base Word *
                    </label>
                    <input
                      type="text"
                      id="baseWord"
                      value={baseWord}
                      onChange={(e) => setBaseWord(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  {/* Image */}
                  <ImageInput
                    label="Image"
                    value={imageUrl}
                    onChange={setImageUrl}
                    onGenerateImage={async () => {
                      const firstTranslation = translations.find(t => t.translation)?.translation || '';
                      return { word: baseWord, translation: firstTranslation };
                    }}
                    showGenerateButton={true}
                    disabled={loading}
                  />

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Translations */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Translations</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add translations in different languages.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="space-y-4">
                  {translations.map((trans, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-md">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Translation {index + 1}</h4>
                        {translations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTranslation(index)}
                            className="text-sm text-red-600 hover:text-red-500"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {/* Language */}
                        <LanguageSelect
                          label="Language"
                          value={trans.languageId || null}
                          onChange={(languageId) => updateTranslation(index, 'languageId', languageId)}
                          languages={languages}
                          required={true}
                          placeholder="Select language..."
                        />

                        {/* Translation */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Translation *
                          </label>
                          <input
                            type="text"
                            value={trans.translation}
                            onChange={(e) => updateTranslation(index, 'translation', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>

                        {/* Romanization */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Romanization (optional)
                          </label>
                          <input
                            type="text"
                            value={trans.romanization || ''}
                            onChange={(e) => updateTranslation(index, 'romanization', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        {/* Audio */}
                        <AudioInput
                          label="Audio"
                          value={trans.audioUrl || ''}
                          onChange={(url) => updateTranslation(index, 'audioUrl', url)}
                          languageCode={languages.find(l => l.id === trans.languageId)?.code}
                          onGenerateTTS={async () => ({
                            text: trans.translation,
                            languageCode: languages.find(l => l.id === trans.languageId)?.code
                          })}
                          showRecordButton={true}
                          showTTSButton={true}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addTranslation}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Translation
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/words')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 shadow-sm text-sm font-medium rounded-lg text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Word' : 'Create Word'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default WordForm;
