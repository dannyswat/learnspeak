import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topicService } from '../services/topicService';
import { wordService, uploadService } from '../services/wordService';
import ttsService from '../services/ttsService';
import Layout from '../components/Layout';
import type { Language } from '../types/word';

interface WordEntry {
  baseWord: string;
  translation: string;
  romanization: string;
  notes: string;
  imageUrl: string;
  audioUrl: string;
}

const BulkWordCreation: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const [wordCount, setWordCount] = useState<number>(5);
  const [targetLanguage, setTargetLanguage] = useState<number | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [topicName, setTopicName] = useState<string>('');
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Upload and recording state
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState<number | null>(null);
  const [generatingTTS, setGeneratingTTS] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Refs for audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    loadLanguages();
    if (topicId) {
      loadTopic();
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
  }, [topicId]);

  useEffect(() => {
    // Initialize words array when count changes
    const newWords = Array.from({ length: wordCount }, (_, i) => 
      words[i] || { baseWord: '', translation: '', romanization: '', notes: '', imageUrl: '', audioUrl: '' }
    );
    setWords(newWords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordCount]);

  const loadLanguages = async () => {
    try {
      const data = await wordService.getLanguages();
      setLanguages(data);
      
      // Default to first language if available
      if (data.length > 0 && !targetLanguage) {
        setTargetLanguage(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load languages:', err);
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

  const handleWordChange = (index: number, field: keyof WordEntry, value: string) => {
    const newWords = [...words];
    newWords[index] = { ...newWords[index], [field]: value };
    setWords(newWords);
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(index);
      const response = await uploadService.uploadImage(file);
      handleWordChange(index, 'imageUrl', response.url);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleAudioUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAudio(index);
      const response = await uploadService.uploadAudio(file);
      handleWordChange(index, 'audioUrl', response.url);
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        
        try {
          setUploadingAudio(index);
          const response = await uploadService.uploadAudio(audioFile);
          handleWordChange(index, 'audioUrl', response.url);
        } catch (err) {
          const error = err as { response?: { data?: { message?: string } } };
          alert(error.response?.data?.message || 'Failed to upload audio');
        } finally {
          setUploadingAudio(null);
        }

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

  const generateTTS = async (index: number) => {
    const word = words[index];
    if (!word.translation) {
      alert('Please enter a translation first');
      return;
    }

    try {
      setGeneratingTTS(index);
      const language = languages.find(l => l.id === targetLanguage);
      const response = await ttsService.generateAudio({
        text: word.translation,
        language: language?.code || 'zh-HK',
      });
      handleWordChange(index, 'audioUrl', response.audioUrl);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || 'Failed to generate audio');
    } finally {
      setGeneratingTTS(null);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quick Add Words</h2>
          <p className="text-gray-600">
            Quickly create multiple words and add them to "{topicName}" in one go
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Configuration */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Setup</h3>
          
          <div className="grid grid-cols-2 gap-6">
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
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">words (max 100)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Language
              </label>
              <select
                value={targetLanguage || ''}
                onChange={(e) => setTargetLanguage(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select language...</option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Word Entry Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Enter Words</h3>
              <button
                type="button"
                onClick={addMoreWords}
                disabled={wordCount >= 100}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add 5 More
              </button>
            </div>

            <div className="space-y-6">
              {words.map((word, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-medium text-green-700">
                      {index + 1}
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          English Word *
                        </label>
                        <input
                          type="text"
                          value={word.baseWord}
                          onChange={(e) => handleWordChange(index, 'baseWord', e.target.value)}
                          placeholder="e.g., Hello"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Translation *
                        </label>
                        <input
                          type="text"
                          value={word.translation}
                          onChange={(e) => handleWordChange(index, 'translation', e.target.value)}
                          placeholder="e.g., 你好"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Romanization
                        </label>
                        <input
                          type="text"
                          value={word.romanization}
                          onChange={(e) => handleWordChange(index, 'romanization', e.target.value)}
                          placeholder="e.g., nei5 hou2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Notes (optional)
                        </label>
                        <input
                          type="text"
                          value={word.notes}
                          onChange={(e) => handleWordChange(index, 'notes', e.target.value)}
                          placeholder="e.g., Informal greeting"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeWord(index)}
                      className="flex-shrink-0 w-8 h-8 text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center"
                      title="Remove word"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Image and Audio Section - Side by Side */}
                  <div className="ml-12 grid grid-cols-2 gap-6">
                    {/* Image Upload Section - Left */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Image (optional)
                      </label>
                      <div className="flex items-center gap-3">
                        {word.imageUrl && (
                          <img
                            src={uploadService.getFileUrl(word.imageUrl)}
                            alt="Word"
                            className="h-16 w-16 object-cover rounded border border-gray-200"
                          />
                        )}
                        <div className="flex flex-col gap-2">
                          <label className="cursor-pointer bg-white py-1.5 px-3 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            {uploadingImage === index ? 'Uploading...' : '📷 Upload Image'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(index, e)}
                              disabled={uploadingImage === index}
                              className="sr-only"
                            />
                          </label>
                          {word.imageUrl && (
                            <button
                              type="button"
                              onClick={() => handleWordChange(index, 'imageUrl', '')}
                              className="text-xs text-red-600 hover:text-red-500 text-left"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Audio Recording Section - Right */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Audio Pronunciation (optional)
                      </label>
                      
                      {word.audioUrl && (
                        <div className="flex items-center gap-2 mb-2">
                          <audio
                            src={uploadService.getFileUrl(word.audioUrl)}
                            controls
                            className="h-8 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleWordChange(index, 'audioUrl', '')}
                            className="text-xs text-red-600 hover:text-red-500 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        {isRecording === index ? (
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg flex-1">
                              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                              <span className="text-xs font-medium text-red-700">
                                Recording: {formatRecordingTime(recordingTime)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="bg-red-600 text-white py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                            >
                              ⏹ Stop
                            </button>
                          </div>
                        ) : uploadingAudio === index ? (
                          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
                            <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-xs font-medium text-blue-700">Uploading...</span>
                          </div>
                        ) : generatingTTS === index ? (
                          <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg">
                            <svg className="animate-spin h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-xs font-medium text-purple-700">Generating...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 w-full">
                            <button
                              type="button"
                              onClick={() => generateTTS(index)}
                              className="bg-purple-500 text-white py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-purple-600 transition-colors w-full"
                            >
                              🎙️ Generate Audio
                            </button>
                            <button
                              type="button"
                              onClick={() => startRecording(index)}
                              className="bg-green-500 text-white py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-green-600 transition-colors w-full"
                            >
                              🎤 Record Audio
                            </button>
                            <label className="cursor-pointer bg-white py-1.5 px-3 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center">
                              📁 Upload Audio File
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => handleAudioUpload(index, e)}
                                className="sr-only"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              * Required fields. Empty entries will be skipped.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between bg-white shadow rounded-lg p-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
            >
              Cancel
            </button>

            <div className="flex gap-3">
              <div className="text-sm text-gray-600 self-center">
                {words.filter(w => w.baseWord.trim() && w.translation.trim()).length} valid entries
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Creating Words...' : `Create & Add Words`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default BulkWordCreation;
