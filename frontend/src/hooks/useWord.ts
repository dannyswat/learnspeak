import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wordService } from '../services/wordService';
import type { WordFilterParams, CreateWordRequest, UpdateWordRequest } from '../types/word';

const WORD_KEYS = {
  all: ['word'] as const,
  lists: ['word', 'list'] as const,
  list: (filters: Omit<WordFilterParams, 'pageSize'>) => [...WORD_KEYS.lists, filters] as const,
  details: ['word', 'detail'] as const,
  detail: (id: number) => [...WORD_KEYS.details, id] as const,
};

export const useWords = (params: WordFilterParams) => {
  return useQuery({
    queryKey: WORD_KEYS.list({ page: params.page, search: params.search }),
    queryFn: () => wordService.getWords(params),
    enabled: !!params,
  });
};

export const useWord = (id: number) => {
  return useQuery({
    queryKey: WORD_KEYS.detail(id),
    queryFn: () => wordService.getWord(id),
    enabled: !!id,
  });
};

export const useCreateWord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWordRequest) => wordService.createWord(data),
    onSuccess: () => {
      // Invalidate all word queries
      queryClient.invalidateQueries({
        queryKey: WORD_KEYS.all,
      });
    },
  });
};

export const useUpdateWord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWordRequest }) =>
      wordService.updateWord(id, data),
    onSuccess: () => {
      // Invalidate all word queries
      queryClient.invalidateQueries({
        queryKey: WORD_KEYS.all,
      });
    },
  });
};

export const useDeleteWord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => wordService.deleteWord(id),
    onSuccess: () => {
      // Invalidate all word lists and details
      queryClient.invalidateQueries({
        queryKey: WORD_KEYS.all,
      });
    },
  });
};

// Helper to manually invalidate word cache (for use in pages that don't use mutations)
export const useInvalidateWords = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: WORD_KEYS.all });
  };
};

// Helper to invalidate both words and a specific topic
export const useInvalidateWordsAndTopic = () => {
  const queryClient = useQueryClient();
  
  return (topicId?: number) => {
    queryClient.invalidateQueries({ queryKey: WORD_KEYS.all });
    if (topicId) {
      queryClient.invalidateQueries({ queryKey: ['topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['topics', 'detail', topicId]});
    }
  };
};
