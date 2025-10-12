import api from './api';
import type {
  Topic,
  CreateTopicRequest,
  UpdateTopicRequest,
  TopicListResponse,
  TopicFilterParams,
} from '../types/topic';

class TopicService {
  async getTopics(params?: TopicFilterParams): Promise<TopicListResponse> {
    const response = await api.get<TopicListResponse>('/topics', { params });
    return response.data;
  }

  async getTopic(id: number, includeWords: boolean = false): Promise<Topic> {
    const response = await api.get<Topic>(`/topics/${id}`, {
      params: { includeWords },
    });
    return response.data;
  }

  async createTopic(data: CreateTopicRequest): Promise<Topic> {
    const response = await api.post<Topic>('/topics', data);
    return response.data;
  }

  async updateTopic(id: number, data: UpdateTopicRequest): Promise<Topic> {
    const response = await api.put<Topic>(`/topics/${id}`, data);
    return response.data;
  }

  async deleteTopic(id: number): Promise<void> {
    await api.delete(`/topics/${id}`);
  }

  async reorderWords(topicId: number, wordIds: number[]): Promise<void> {
    await api.put(`/topics/${topicId}/words/reorder`, { wordIds });
  }

  async addWordsToTopic(topicId: number, wordIds: number[]): Promise<void> {
    await api.post(`/topics/${topicId}/words`, { wordIds });
  }
}

export const topicService = new TopicService();
