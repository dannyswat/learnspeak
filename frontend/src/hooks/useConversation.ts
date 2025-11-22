import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '../services/conversationService';
import type { CreateConversationRequest, UpdateConversationRequest } from '../types/conversation';

const CONVERSATION_KEYS = {
  all: ['conversation'] as const,
  byTopic: (topicId: number) => [...CONVERSATION_KEYS.all, 'byTopic', topicId] as const,
};

export const useConversationsByTopic = (topicId: number) => {
  return useQuery({
    queryKey: CONVERSATION_KEYS.byTopic(topicId),
    queryFn: () => conversationService.getConversationsByTopic(topicId),
    enabled: !!topicId,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationRequest) => conversationService.createConversation(data),
    onSuccess: () => {
      // Invalidate all conversation queries
      queryClient.invalidateQueries({
        queryKey: CONVERSATION_KEYS.all,
      });
    },
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateConversationRequest }) =>
      conversationService.updateConversation(id, data),
    onSuccess: () => {
      // Invalidate all conversation queries
      queryClient.invalidateQueries({
        queryKey: CONVERSATION_KEYS.all,
      });
    },
  });
};

// Helper to invalidate conversations and a specific topic
export const useInvalidateConversationsAndTopic = () => {
  const queryClient = useQueryClient();
  
  return (topicId?: number) => {
    queryClient.invalidateQueries({ queryKey: CONVERSATION_KEYS.all });
    if (topicId) {
      queryClient.invalidateQueries({ queryKey: ['topic', topicId] });
    }
  };
};
