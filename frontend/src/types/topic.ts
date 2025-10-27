// Topic and related types

export interface Language {
  id: number;
  code: string;
  name: string;
  nativeName: string;
}

export interface Creator {
  id: number;
  name: string;
  email: string;
}

export interface TopicWord {
  id: number;
  baseWord: string;
  translation: string;
  romanization: string;
  audioUrl: string;
  imageUrl: string;
  sequenceOrder: number;
}

export interface Topic {
  id: number;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  isPublic: boolean;
  language?: Language;
  createdBy?: Creator;
  wordCount: number;
  words?: TopicWord[];
  quizCount: number;
  conversationCount: number;
  usedInJourneys: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicRequest {
  name: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  languageCode: string;
  wordIds?: number[];
  isPublic?: boolean;
}

export interface UpdateTopicRequest {
  name?: string;
  description?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  languageCode?: string;
  wordIds?: number[];
  isPublic?: boolean;
}

export interface TopicListResponse {
  topics: Topic[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TopicFilterParams {
  search?: string;
  level?: string;
  languageCode?: string;
  createdBy?: number;
  isPublic?: boolean;
  page?: number;
  pageSize?: number;
  includeWords?: boolean;
}
