import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
import { uploadService } from '../services/wordService';
import Layout from '../components/Layout';
import type { QuizQuestion, CreateQuizQuestionRequest } from '../types/quiz';

const QuizManagement: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  
  // Upload and recording state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Refs for audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  
  const [formData, setFormData] = useState<CreateQuizQuestionRequest>({
    topicId: parseInt(topicId!),
    questionType: 'translation',
    questionText: '',
    correctAnswer: 'a',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
  });

  useEffect(() => {
    if (topicId) {
      loadQuestions();
    }
    
    // Load last used question type from localStorage
    const lastQuestionType = localStorage.getItem('lastQuizQuestionType');
    if (lastQuestionType && (lastQuestionType === 'translation' || lastQuestionType === 'listening' || lastQuestionType === 'image')) {
      setFormData(prev => ({ ...prev, questionType: lastQuestionType }));
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

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await quizService.getTopicQuestions(parseInt(topicId!));
      setQuestions(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Save question type to localStorage for next time
      localStorage.setItem('lastQuizQuestionType', formData.questionType);
      
      if (editingQuestion) {
        await quizService.updateQuestion(editingQuestion.id, formData);
      } else {
        await quizService.createQuestion(formData);
      }
      
      resetForm();
      loadQuestions();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to save question');
    }
  };

  const handleEdit = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setFormData({
      topicId: question.topicId,
      questionType: question.questionType,
      questionText: question.questionText,
      audioUrl: question.audioUrl,
      imageUrl: question.imageUrl,
      correctAnswer: question.correctAnswer,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await quizService.deleteQuestion(id);
      loadQuestions();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to delete question');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const response = await uploadService.uploadImage(file);
      setFormData({ ...formData, imageUrl: response.url });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAudio(true);
      const response = await uploadService.uploadAudio(file);
      setFormData({ ...formData, audioUrl: response.url });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to upload audio');
    } finally {
      setUploadingAudio(false);
    }
  };

  const startRecording = async () => {
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
          setUploadingAudio(true);
          const response = await uploadService.uploadAudio(audioFile);
          setFormData({ ...formData, audioUrl: response.url });
        } catch (err) {
          const error = err as { response?: { data?: { message?: string } } };
          alert(error.response?.data?.message || 'Failed to upload audio');
        } finally {
          setUploadingAudio(false);
        }

        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
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

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetForm = () => {
    // Load last used question type from localStorage
    const lastQuestionType = localStorage.getItem('lastQuizQuestionType');
    const questionType = (lastQuestionType === 'translation' || lastQuestionType === 'listening' || lastQuestionType === 'image') 
      ? lastQuestionType 
      : 'translation';
    
    setFormData({
      topicId: parseInt(topicId!),
      questionType,
      questionText: '',
      correctAnswer: 'a',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading questions...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <button onClick={() => navigate(`/topics/${topicId}`)} className="hover:text-green-600">
              Topic
            </button>
            <span>›</span>
            <span className="text-gray-900">Quiz Management</span>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Quiz Questions</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              + Add Question
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Question Form */}
        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingQuestion ? 'Edit Question' : 'New Question'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type
                  </label>
                  <select
                    value={formData.questionType}
                    onChange={(e) =>
                      setFormData({ ...formData, questionType: e.target.value as 'translation' | 'listening' | 'image' })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="translation">Translation</option>
                    <option value="listening">Listening</option>
                    <option value="image">Image</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correct Answer
                  </label>
                  <select
                    value={formData.correctAnswer}
                    onChange={(e) =>
                      setFormData({ ...formData, correctAnswer: e.target.value as 'a' | 'b' | 'c' | 'd' })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="a">A</option>
                    <option value="b">B</option>
                    <option value="c">C</option>
                    <option value="d">D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text
                </label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={2}
                  required
                />
              </div>

              {/* Audio Upload/Recording for Listening Questions */}
              {formData.questionType === 'listening' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio File (Required for Listening Questions)
                  </label>
                  
                  {formData.audioUrl && (
                    <div className="flex items-center gap-2 mb-2">
                      <audio
                        src={uploadService.getFileUrl(formData.audioUrl)}
                        controls
                        className="h-10 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, audioUrl: undefined })}
                        className="text-sm text-red-600 hover:text-red-500 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {isRecording ? (
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-lg flex-1">
                          <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                          <span className="text-sm font-medium text-red-700">
                            Recording: {formatRecordingTime(recordingTime)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700"
                        >
                          ⏹ Stop
                        </button>
                      </div>
                    ) : uploadingAudio ? (
                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
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
                          onClick={startRecording}
                          className="bg-green-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-600"
                        >
                          🎤 Record Audio
                        </button>
                        <span className="text-gray-400">or</span>
                        <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                          📁 Upload Audio File
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={handleAudioUpload}
                            className="sr-only"
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Image Upload for Image Questions */}
              {formData.questionType === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image (Required for Image Questions)
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.imageUrl && (
                      <img
                        src={uploadService.getFileUrl(formData.imageUrl)}
                        alt="Question"
                        className="h-32 w-32 object-cover rounded border border-gray-200"
                      />
                    )}
                    <div className="flex flex-col gap-2">
                      <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                        {uploadingImage ? 'Uploading...' : '📷 Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="sr-only"
                        />
                      </label>
                      {formData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: undefined })}
                          className="text-sm text-red-600 hover:text-red-500 text-left"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Option A
                  </label>
                  <input
                    type="text"
                    value={formData.optionA}
                    onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Option B
                  </label>
                  <input
                    type="text"
                    value={formData.optionB}
                    onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Option C
                  </label>
                  <input
                    type="text"
                    value={formData.optionC}
                    onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Option D
                  </label>
                  <input
                    type="text"
                    value={formData.optionD}
                    onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  {editingQuestion ? 'Update' : 'Create'} Question
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Questions List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Questions ({questions.length})
          </h3>

          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No questions yet. Add your first question to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-700">Q{index + 1}.</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {question.questionType}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Answer: {question.correctAnswer.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium mb-2">{question.questionText}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(question)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {(['a', 'b', 'c', 'd'] as const).map((option) => {
                      const isCorrect = question.correctAnswer === option;
                      const optionText = question[`option${option.toUpperCase()}` as keyof typeof question];

                      return (
                        <div
                          key={option}
                          className={`p-2 rounded ${
                            isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                          }`}
                        >
                          <span className="font-medium">{option.toUpperCase()}.</span> {optionText}
                          {isCorrect && <span className="ml-2 text-green-600">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default QuizManagement;
