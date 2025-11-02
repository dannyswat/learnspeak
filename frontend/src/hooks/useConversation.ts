import { useQuery } from '@tanstack/react-query';
import { conversationService } from '../services/conversationService';

const CONVERSATION_KEYS = {
  all: ['conversations'] as const,
  byTopic: (topicId: number) => [...CONVERSATION_KEYS.all, 'byTopic', topicId] as const,
};

export const useConversationsByTopic = (topicId: number) => {
  return useQuery({
    queryKey: CONVERSATION_KEYS.byTopic(topicId),
    queryFn: () => conversationService.getConversationsByTopic(topicId),
    enabled: !!topicId,
  });
};
