import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { wordService, uploadService } from '../services/wordService';
import type { CreateWordRequest, UpdateWordRequest, Language, CreateTranslationInput, UpdateTranslationInput } from '../types/word';

const WordForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [languages, setLanguages] = useState<Language[]>([]);

  // Form state
  const [baseWord, setBaseWord] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [translations, setTranslations] = useState<(CreateTranslationInput | UpdateTranslationInput)[]>([
    { languageId: 0, translation: '', romanization: '', audioUrl: '' }
  ]);

  // Upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState<number | null>(null);

  useEffect(() => {
    loadLanguages();
    if (isEditMode && id) {
      loadWord(parseInt(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadLanguages = async () => {
    try {
      const langs = await wordService.getLanguages();
      setLanguages(langs);
    } catch (err) {
      console.error('Error loading languages:', err);
    }
  };

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
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const response = await uploadService.uploadImage(file);
      setImageUrl(response.url);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAudioUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAudio(index);
      const response = await uploadService.uploadAudio(file);
      updateTranslation(index, 'audioUrl', response.url);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to upload audio');
    } finally {
      setUploadingAudio(null);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading word...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {isEditMode ? 'Edit Word' : 'Create New Word'}
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => navigate('/words')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Image
                    </label>
                    <div className="mt-1 flex items-center space-x-4">
                      {imageUrl && (
                        <img
                          src={uploadService.getFileUrl(imageUrl)}
                          alt="Word"
                          className="h-20 w-20 object-cover rounded"
                        />
                      )}
                      <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="sr-only"
                        />
                      </label>
                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="text-sm text-red-600 hover:text-red-500"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

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
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Language *
                          </label>
                          <select
                            value={trans.languageId}
                            onChange={(e) => updateTranslation(index, 'languageId', parseInt(e.target.value))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          >
                            <option value={0}>Select language...</option>
                            {languages.map((lang) => (
                              <option key={lang.id} value={lang.id}>
                                {lang.name} ({lang.nativeName})
                              </option>
                            ))}
                          </select>
                        </div>

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
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Audio
                          </label>
                          <div className="mt-1 flex items-center space-x-4">
                            {trans.audioUrl && (
                              <audio
                                src={uploadService.getFileUrl(trans.audioUrl)}
                                controls
                                className="h-10"
                              />
                            )}
                            <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                              {uploadingAudio === index ? 'Uploading...' : 'Upload Audio'}
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => handleAudioUpload(index, e)}
                                disabled={uploadingAudio === index}
                                className="sr-only"
                              />
                            </label>
                            {trans.audioUrl && (
                              <button
                                type="button"
                                onClick={() => updateTranslation(index, 'audioUrl', '')}
                                className="text-sm text-red-600 hover:text-red-500"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addTranslation}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Word' : 'Create Word'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WordForm;
