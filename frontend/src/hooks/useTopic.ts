import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { topicService } from '../services/topicService';
import type { TopicFilterParams, CreateTopicRequest, UpdateTopicRequest } from '../types/topic';

const TOPIC_KEYS = {
  all: ['topics'] as const,
  lists: ['topics', 'list'] as const,
  list: (filters: Omit<TopicFilterParams, 'pageSize'>) => [...TOPIC_KEYS.lists, filters] as const,
  details: () => [...TOPIC_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...TOPIC_KEYS.details(), id] as const,
};

export const useTopics = (params: TopicFilterParams) => {
  return useQuery({
    queryKey: TOPIC_KEYS.list({
      page: params.page,
      search: params.search,
      level: params.level,
      languageCode: params.languageCode,
    }),
    queryFn: () => topicService.getTopics(params),
    enabled: !!params,
  });
};

export const useTopic = (topicId: number, includeWords: boolean = false) => {
  return useQuery({
    queryKey: TOPIC_KEYS.detail(topicId),
    queryFn: () => topicService.getTopic(topicId, includeWords),
    enabled: !!topicId,
  });
};

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (topicId: number) => topicService.deleteTopic(topicId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TOPIC_KEYS.all,
      });
    },
  });
};

export const useCreateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTopicRequest) => topicService.createTopic(data),
    onSuccess: () => {
      // Invalidate all topic queries
      queryClient.invalidateQueries({
        queryKey: TOPIC_KEYS.all,
      });
    },
  });
};

export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTopicRequest }) =>
      topicService.updateTopic(id, data),
    onSuccess: () => {
      // Invalidate all topic queries
      queryClient.invalidateQueries({
        queryKey: TOPIC_KEYS.all,
      });
    },
  });
};

// Helper to manually invalidate topic cache (for use in pages that don't use mutations)
export const useInvalidateTopics = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: TOPIC_KEYS.all });
  };
};
