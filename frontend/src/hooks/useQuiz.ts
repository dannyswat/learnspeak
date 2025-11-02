import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizService } from '../services/quizService';
import type { CreateQuizQuestionRequest } from '../types/quiz';

const QUIZ_KEYS = {
  all: ['quiz'] as const,
  questions: ['quiz', 'questions'] as const,
  questionsByTopic: (topicId: number) => [...QUIZ_KEYS.questions, topicId] as const,
  practice: ['quiz', 'practice'] as const,
  practiceByTopic: (topicId: number) => [...QUIZ_KEYS.practice, topicId] as const,
};

export const useTopicQuestions = (topicId: number) => {
  return useQuery({
    queryKey: QUIZ_KEYS.questionsByTopic(topicId),
    queryFn: () => quizService.getTopicQuestions(topicId),
    enabled: !!topicId,
  });
};

export const useTopicQuizForPractice = (topicId: number, shuffle: boolean) => {
  return useQuery({
    queryKey: QUIZ_KEYS.practiceByTopic(topicId),
    queryFn: () => quizService.getTopicQuizForPractice(topicId, shuffle),
    enabled: !!topicId,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuizQuestionRequest) => quizService.createQuestion(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUIZ_KEYS.questionsByTopic(variables.topicId),
      });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateQuizQuestionRequest }) =>
      quizService.updateQuestion(id, data),
    onSuccess: (updatedQuestion) => {
      queryClient.invalidateQueries({
        queryKey: QUIZ_KEYS.questionsByTopic(updatedQuestion.topicId),
      });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => quizService.deleteQuestion(id),
    onSuccess: () => {
      // Invalidate all quiz questions queries
      queryClient.invalidateQueries({
        queryKey: QUIZ_KEYS.questions,
      });
    },
  });
};

export const useSubmitQuiz = () => {
  return useMutation({
    mutationFn: ({ topicId, data }: { topicId: number; data: Parameters<typeof quizService.submitQuiz>[1] }) =>
      quizService.submitQuiz(topicId, data),
  });
};

