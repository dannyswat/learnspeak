// Journey-related TypeScript interfaces

export interface JourneyTopicInfo {
  id: number;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  wordCount: number;
  quizCount: number;
  sequenceOrder: number;
  completed?: boolean;
  quizScore?: number;
}

export interface Journey {
  id: number;
  name: string;
  description: string;
  language?: {
    id: number;
    code: string;
    name: string;
    nativeName: string;
  };
  createdBy?: {
    id: number;
    name: string;
    email: string;
  };
  topicCount: number;
  totalWords: number;
  topics?: JourneyTopicInfo[];
  assignedToCount: number;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export interface JourneyListResponse {
  journeys: Journey[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateJourneyRequest {
  name: string;
  description: string;
  languageCode: string;
  topicIds?: number[];
}

export interface UpdateJourneyRequest {
  name?: string;
  description?: string;
  languageCode?: string;
  topicIds?: number[];
}

export interface JourneyFilterParams {
  search?: string;
  languageCode?: string;
  createdBy?: number;
  page?: number;
  pageSize?: number;
  includeTopics?: boolean;
}

export interface AssignJourneyRequest {
  userIds: number[];
  message?: string;
}
