// User-related TypeScript interfaces

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  profilePicUrl?: string;
  roles: string[];
  createdAt: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserFilterParams {
  search?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  profilePicUrl?: string;
}

// User journey assignment interfaces
export interface UserJourney {
  id: number;
  userId: number;
  journeyId: number;
  journey?: {
    id: number;
    name: string;
    description: string;
    topicCount: number;
    totalWords: number;
    language?: {
      id: number;
      code: string;
      name: string;
      nativeName: string;
    };
  };
  user?: {
    id: number;
    username: string;
    name: string;
    email: string;
    roles?: string[];
  };
  assignedBy?: {
    id: number;
    username: string;
    name: string;
    email: string;
  };
  status: 'assigned' | 'in_progress' | 'completed';
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  progress?: number;
  totalTopics?: number;
  completedTopics?: number;
  nextTopic?: {
    id: number;
    name: string;
    description: string;
    level: string;
    wordCount: number;
    quizCount: number;
    sequenceOrder: number;
    completed: boolean;
  };
}

export interface UserJourneyListResponse {
  userJourneys: UserJourney[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AssignJourneyRequest {
  userIds: number[];
  message?: string;
}

export interface UnassignJourneyRequest {
  userIds: number[];
}

export interface AssignJourneyResponse {
  assignedCount: number;
  assignments: {
    userId: number;
    userName: string;
    assignedAt: string;
  }[];
}
