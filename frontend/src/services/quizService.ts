import api from './api';
import type {
  QuizQuestion,
  CreateQuizQuestionRequest,
  UpdateQuizQuestionRequest,
  QuizQuestionsResponse,
  QuizSubmissionRequest,
  QuizResult,
} from '../types/quiz';

export const quizService = {
  // Create a new quiz question
  createQuestion: async (data: CreateQuizQuestionRequest): Promise<QuizQuestion> => {
    const response = await api.post('/quiz', data);
    return response.data.data;
  },

  // Get a single quiz question by ID
  getQuestion: async (id: number): Promise<QuizQuestion> => {
    const response = await api.get(`/quiz/${id}`);
    return response.data.data;
  },

  // Update a quiz question
  updateQuestion: async (id: number, data: UpdateQuizQuestionRequest): Promise<QuizQuestion> => {
    const response = await api.put(`/quiz/${id}`, data);
    return response.data.data;
  },

  // Delete a quiz question
  deleteQuestion: async (id: number): Promise<void> => {
    await api.delete(`/quiz/${id}`);
  },

  // List all quiz questions with pagination
  listQuestions: async (limit = 10, offset = 0): Promise<{ questions: QuizQuestion[]; total: number }> => {
    const response = await api.get('/quiz', {
      params: { limit, offset },
    });
    return response.data.data;
  },

  // Get all quiz questions for a topic (teacher view with answers)
  getTopicQuestions: async (topicId: number): Promise<QuizQuestion[]> => {
    const response = await api.get(`/topics/${topicId}/quiz`);
    return response.data.data;
  },

  // Get quiz questions for practice (learner view without answers)
  getTopicQuizForPractice: async (topicId: number, shuffle = true): Promise<QuizQuestionsResponse> => {
    const response = await api.get(`/topics/${topicId}/quiz/practice`, {
      params: { shuffle },
    });
    return response.data.data;
  },

  // Submit quiz answers
  submitQuiz: async (topicId: number, submission: QuizSubmissionRequest): Promise<QuizResult> => {
    const response = await api.post(`/topics/${topicId}/quiz/submit`, submission);
    return response.data.data;
  },
};
