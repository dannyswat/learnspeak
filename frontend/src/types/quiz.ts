// Quiz question type (for teachers, includes correct answer)
export interface QuizQuestion {
  id: number;
  topicId: number;
  wordId?: number;
  questionType: 'translation' | 'listening' | 'image';
  questionText: string;
  audioUrl?: string;
  imageUrl?: string;
  correctAnswer: 'a' | 'b' | 'c' | 'd';
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  createdAt?: string;
  updatedAt?: string;
}

// Quiz question for practice (for learners, without correct answer)
export interface QuizQuestionForPractice {
  id: number;
  questionType: 'translation' | 'listening' | 'image';
  questionText: string;
  audioUrl?: string;
  imageUrl?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  wordId?: number;
}

// Request to create a quiz question
export interface CreateQuizQuestionRequest {
  topicId: number;
  wordId?: number;
  questionType: 'translation' | 'listening' | 'image';
  questionText: string;
  audioUrl?: string;
  imageUrl?: string;
  correctAnswer: 'a' | 'b' | 'c' | 'd';
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

// Request to update a quiz question
export interface UpdateQuizQuestionRequest {
  questionType?: 'translation' | 'listening' | 'image';
  questionText?: string;
  audioUrl?: string;
  imageUrl?: string;
  correctAnswer?: 'a' | 'b' | 'c' | 'd';
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
}

// Single answer in a quiz submission
export interface QuizAnswer {
  questionId: number;
  answer: 'a' | 'b' | 'c' | 'd';
}

// Quiz submission request
export interface QuizSubmissionRequest {
  topicId: number;
  journeyId?: number;
  answers: QuizAnswer[];
  timeSpent: number; // in seconds
}

// Result for a single question
export interface QuestionResult {
  questionId: number;
  questionType: 'translation' | 'listening' | 'image';
  questionText: string;
  audioUrl?: string;
  imageUrl?: string;
  userAnswer: 'a' | 'b' | 'c' | 'd';
  correctAnswer: 'a' | 'b' | 'c' | 'd';
  isCorrect: boolean;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

// Quiz result response
export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number; // percentage
  timeSpent: number; // in seconds
  passed: boolean;
  questionResults: QuestionResult[];
}

// Response for quiz questions list
export interface QuizQuestionsResponse {
  questions: QuizQuestionForPractice[];
}
