import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
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

  const resetForm = () => {
    setFormData({
      topicId: parseInt(topicId!),
      questionType: 'translation',
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
