import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { wordService, uploadService } from '../services/wordService';
import type { CreateWordRequest, UpdateWordRequest, Language, CreateTranslationInput, UpdateTranslationInput } from '../types/word';
import Layout from '../components/Layout';

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

  // Audio recording state
  const [isRecording, setIsRecording] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    loadLanguages();
    if (isEditMode && id) {
      loadWord(parseInt(id));
    }
    
    // Cleanup on unmount
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
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

  const startRecording = async (index: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Create audio file from recorded chunks
        // WebM format is widely supported and works across browsers
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        
        // Upload the recorded audio
        try {
          setUploadingAudio(index);
          const response = await uploadService.uploadAudio(audioFile);
          updateTranslation(index, 'audioUrl', response.url);
        } catch (err) {
          const error = err as { response?: { data?: { message?: string } } };
          alert(error.response?.data?.message || 'Failed to upload audio');
        } finally {
          setUploadingAudio(null);
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(null);
        setRecordingTime(0);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      };

      mediaRecorder.start();
      setIsRecording(index);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                          <div className="mt-1 space-y-2">
                            {/* Audio Player */}
                            {trans.audioUrl && (
                              <div className="flex items-center space-x-2">
                                <audio
                                  src={uploadService.getFileUrl(trans.audioUrl)}
                                  controls
                                  className="h-10 flex-1"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateTranslation(index, 'audioUrl', '')}
                                  className="text-sm text-red-600 hover:text-red-500 font-medium"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                            
                            {/* Recording Controls */}
                            <div className="flex items-center space-x-2">
                              {isRecording === index ? (
                                <div className="flex items-center space-x-2 flex-1">
                                  <div className="flex items-center space-x-2 bg-red-50 border border-red-200 px-4 py-2 rounded-lg flex-1">
                                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                                    <span className="text-sm font-medium text-red-700">
                                      Recording: {formatRecordingTime(recordingTime)}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={stopRecording}
                                    className="bg-red-600 text-white py-2 px-4 rounded-lg shadow-sm text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                  >
                                    ⏹ Stop
                                  </button>
                                </div>
                              ) : uploadingAudio === index ? (
                                <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
                                  <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span className="text-sm font-medium text-blue-700">Uploading...</span>
                                </div>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => startRecording(index)}
                                    className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-sm text-sm font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                  >
                                    🎤 Record Audio
                                  </button>
                                  <span className="text-gray-400">or</span>
                                  <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                                    📁 Upload File
                                    <input
                                      type="file"
                                      accept="audio/*"
                                      onChange={(e) => handleAudioUpload(index, e)}
                                      className="sr-only"
                                    />
                                  </label>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
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
