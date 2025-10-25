import api from './api';
import type {
  Conversation,
  CreateConversationRequest,
  UpdateConversationRequest,
  CreateConversationLineRequest,
  UpdateConversationLineRequest,
  ConversationListResponse,
  ConversationFilterParams,
  ConversationLine,
} from '../types/conversation';

class ConversationService {
  /**
   * Create a new conversation
   */
  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    const response = await api.post<Conversation>('/conversations', data);
    return response.data;
  }

  /**
   * Get a single conversation by ID
   */
  async getConversation(id: number): Promise<Conversation> {
    const response = await api.get<Conversation>(`/conversations/${id}`);
    return response.data;
  }

  /**
   * Get all conversations for a specific topic
   */
  async getConversationsByTopic(topicId: number): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>(`/topics/${topicId}/conversations`);
    return response.data;
  }

  /**
   * Update a conversation
   */
  async updateConversation(id: number, data: UpdateConversationRequest): Promise<Conversation> {
    const response = await api.put<Conversation>(`/conversations/${id}`, data);
    return response.data;
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id: number): Promise<void> {
    await api.delete(`/conversations/${id}`);
  }

  /**
   * List conversations with filters
   */
  async listConversations(params: ConversationFilterParams): Promise<ConversationListResponse> {
    const response = await api.get<ConversationListResponse>('/conversations', { params });
    return response.data;
  }

  /**
   * Add a line to a conversation
   */
  async addLine(conversationId: number, data: CreateConversationLineRequest): Promise<ConversationLine> {
    const response = await api.post<ConversationLine>(`/conversations/${conversationId}/lines`, data);
    return response.data;
  }

  /**
   * Update a conversation line
   */
  async updateLine(conversationId: number, lineId: number, data: UpdateConversationLineRequest): Promise<ConversationLine> {
    const response = await api.put<ConversationLine>(`/conversations/${conversationId}/lines/${lineId}`, data);
    return response.data;
  }

  /**
   * Delete a conversation line
   */
  async deleteLine(conversationId: number, lineId: number): Promise<void> {
    await api.delete(`/conversations/${conversationId}/lines/${lineId}`);
  }

  /**
   * Reorder conversation lines
   */
  async reorderLines(conversationId: number, lineIds: number[]): Promise<void> {
    await api.put(`/conversations/${conversationId}/lines/reorder`, { lineIds });
  }

  /**
   * Link a conversation to a topic
   */
  async linkConversationToTopic(conversationId: number, topicId: number): Promise<void> {
    await api.post(`/conversations/${conversationId}/topics/${topicId}`);
  }

  /**
   * Unlink a conversation from a topic
   */
  async unlinkConversationFromTopic(conversationId: number, topicId: number): Promise<void> {
    await api.delete(`/conversations/${conversationId}/topics/${topicId}`);
  }
}

export const conversationService = new ConversationService();
export default conversationService;
