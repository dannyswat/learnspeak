// Conversation types for dialogue practice

export interface ConversationLine {
  id: number;
  sequenceOrder: number;
  speakerRole: string;
  englishText: string;
  targetText: string;
  romanization: string;
  audioUrl: string;
  imageUrl: string;
  wordId?: number;
  isLearnerLine: boolean;
}

export interface Conversation {
  id: number;
  title: string;
  description: string;
  context: string;
  languageCode: string;
  languageName: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  scenarioAudioUrl?: string;
  scenarioImageUrl?: string;
  lines: ConversationLine[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationLineRequest {
  sequenceOrder: number;
  speakerRole: string;
  englishText: string;
  targetText: string;
  romanization?: string;
  audioUrl?: string;
  imageUrl?: string;
  wordId?: number;
  isLearnerLine: boolean;
}

export interface CreateConversationRequest {
  title: string;
  description?: string;
  context?: string;
  languageCode: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  scenarioAudioUrl?: string;
  scenarioImageUrl?: string;
  topicId?: number;
  lines: CreateConversationLineRequest[];
}

export interface UpdateConversationRequest {
  title?: string;
  description?: string;
  context?: string;
  languageCode?: string;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  scenarioAudioUrl?: string;
  scenarioImageUrl?: string;
}

export interface UpdateConversationLineRequest {
  speakerRole?: string;
  englishText?: string;
  targetText?: string;
  romanization?: string;
  audioUrl?: string;
  imageUrl?: string;
  wordId?: number;
  isLearnerLine?: boolean;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ConversationFilterParams {
  search?: string;
  languageCode?: string;
  difficultyLevel?: string;
  createdBy?: number;
  page?: number;
  pageSize?: number;
}
