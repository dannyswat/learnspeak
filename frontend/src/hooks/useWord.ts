import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wordService } from '../services/wordService';
import type { WordFilterParams } from '../types/word';

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
