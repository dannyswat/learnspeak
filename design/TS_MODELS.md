# LearnSpeak - TypeScript Frontend Models

**Version**: 1.0  
**Language**: TypeScript  
**Date**: October 11, 2025

---

## Package Structure

```
frontend/
├── src/
│   ├── types/
│   │   ├── index.ts
│   │   ├── user.ts
│   │   ├── word.ts
│   │   ├── topic.ts
│   │   ├── journey.ts
│   │   ├── quiz.ts
│   │   ├── progress.ts
│   │   ├── achievement.ts
│   │   ├── bookmark.ts
│   │   ├── note.ts
│   │   ├── srs.ts
│   │   └── api.ts
│   └── services/
│       └── api.ts
```

---

## 1. Base API Types

### types/api.ts

```typescript
/**
 * Standard API response wrapper
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: APIError;
}

/**
 * API error structure
 */
export interface APIError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  message?: string;
}

/**
 * Query parameters for pagination
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Common filter parameters
 */
export interface FilterParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Error codes enumeration
 */
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
}

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API request configuration
 */
export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: any;
  headers?: Record<string, string>;
}
```

---

## 2. User Types

### types/user.ts

```typescript
/**
 * User role types
 */
export type UserRole = 'learner' | 'teacher' | 'admin';

/**
 * Base user interface
 */
export interface User {
  id: number;
  username: string;
  name: string;
  email?: string;
  roles: UserRole[];
  profilePicUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * User summary for nested responses
 */
export interface UserSummary {
  id: number;
  name: string;
  username?: string;
}

/**
 * Registration request
 */
export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  email?: string;
  role: 'learner' | 'teacher';
}

/**
 * Login request
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
  name: string;
  email?: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * User statistics
 */
export interface UserStats {
  totalLearningTimeMinutes: number;
  topicsCompleted: number;
  journeysCompleted: number;
  journeysInProgress: number;
  averageQuizAccuracy: number;
  wordsLearned: number;
  achievementsEarned: number;
  currentStreak: number;
  longestStreak: number;
}

/**
 * Student list item (for teachers)
 */
export interface StudentListItem {
  id: number;
  username: string;
  name: string;
  profilePicUrl?: string;
  journeysAssigned: number;
  journeysCompleted: number;
  averageProgress: number;
  lastActive: string;
}

/**
 * User filter parameters
 */
export interface UserFilterParams extends FilterParams {
  role?: UserRole;
}
```

---

## 3. Language Types

### types/language.ts

```typescript
/**
 * Text direction for languages
 */
export type TextDirection = 'ltr' | 'rtl';

/**
 * Language interface
 */
export interface Language {
  id: number;
  code: string;
  name: string;
  nativeName?: string;
  direction: TextDirection;
  isActive: boolean;
}

/**
 * Language summary for nested responses
 */
export interface LanguageSummary {
  id: number;
  code: string;
  name: string;
}

/**
 * Language list item
 */
export interface LanguageListItem {
  id: number;
  code: string;
  name: string;
  nativeName?: string;
  isActive: boolean;
}
```

---

## 4. Word Types

### types/word.ts

```typescript
import { UserSummary } from './user';
import { TopicSummary } from './topic';
import { LanguageSummary } from './language';

/**
 * Word translation for a specific language
 */
export interface WordTranslation {
  id: number;
  languageCode: string;
  languageName: string;
  translation: string;
  romanization?: string;
  audioUrl?: string;
}

/**
 * Word translation request
 */
export interface WordTranslationRequest {
  languageCode: string;
  translation: string;
  romanization?: string;
}

/**
 * Base word interface
 */
export interface Word {
  id: number;
  baseWord: string;
  imageUrl?: string;
  notes?: string;
  translations: WordTranslation[];
  createdBy: UserSummary;
  usedInTopics?: number;
  topics?: TopicSummary[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Word list item
 */
export interface WordListItem {
  id: number;
  baseWord: string;
  imageUrl?: string;
  translations: WordTranslation[];
  createdBy: UserSummary;
  usedInTopics: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Word in topic context (with specific language translation)
 */
export interface WordInTopic {
  id: number;
  baseWord: string;
  translation: string;
  romanization?: string;
  audioUrl?: string;
  imageUrl?: string;
  sequenceOrder: number;
}

/**
 * Create word request
 */
export interface CreateWordRequest {
  baseWord: string;
  notes?: string;
  translations: WordTranslationRequest[];
}

/**
 * Update word request
 */
export interface UpdateWordRequest {
  baseWord: string;
  notes?: string;
  translations?: WordTranslationRequest[];
}

/**
 * Word filter parameters
 */
export interface WordFilterParams extends FilterParams {
  topicId?: number;
  languageCode?: string;
  createdBy?: number;
}

/**
 * Generate audio request
 */
export interface GenerateAudioRequest {
  text: string;
  languageCode: string;
  voice?: string;
}

/**
 * Audio generation response
 */
export interface AudioGenerationResponse {
  audioUrl: string;
  wordId?: number;
  languageCode: string;
  estimatedCost: number;
}

/**
 * Generate image request
 */
export interface GenerateImageRequest {
  prompt: string;
  wordId?: number;
  style?: 'cartoon' | 'realistic' | 'sketch';
}

/**
 * Image generation response
 */
export interface ImageGenerationResponse {
  imageUrl: string;
  wordId?: number;
  estimatedCost: number;
}
```

---

## 5. Topic Types

### types/topic.ts

```typescript
import { UserSummary } from './user';
import { WordInTopic } from './word';
import { LanguageSummary } from './language';

/**
 * Topic difficulty level
 */
export type TopicLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Base topic interface
 */
export interface Topic {
  id: number;
  name: string;
  description?: string;
  level: TopicLevel;
  language: LanguageSummary;
  createdBy: UserSummary;
  words?: WordInTopic[];
  quizCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Topic list item
 */
export interface TopicListItem {
  id: number;
  name: string;
  description?: string;
  level: TopicLevel;
  language: LanguageSummary;
  wordCount: number;
  createdBy: UserSummary;
  usedInJourneys: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Topic summary for nested responses
 */
export interface TopicSummary {
  id: number;
  name: string;
  level: TopicLevel;
}

/**
 * Topic in journey context
 */
export interface TopicInJourney {
  id: number;
  name: string;
  level: TopicLevel;
  wordCount: number;
  sequenceOrder: number;
  completed: boolean;
  quizScore?: number;
}

/**
 * Create topic request
 */
export interface CreateTopicRequest {
  name: string;
  description?: string;
  level: TopicLevel;
  languageCode: string;
  wordIds?: number[];
}

/**
 * Update topic request
 */
export interface UpdateTopicRequest {
  name: string;
  description?: string;
  level: TopicLevel;
  languageCode?: string;
  wordIds?: number[];
}

/**
 * Reorder words request
 */
export interface ReorderWordsRequest {
  wordIds: number[];
}

/**
 * Topic filter parameters
 */
export interface TopicFilterParams extends FilterParams {
  level?: TopicLevel;
  languageCode?: string;
  createdBy?: number;
}

/**
 * Add words to topic request
 */
export interface AddWordsToTopicRequest {
  wordIds: number[];
}
```

---

## 6. Journey Types

### types/journey.ts

```typescript
import { UserSummary } from './user';
import { TopicInJourney, TopicSummary } from './topic';
import { LanguageSummary } from './language';

/**
 * Journey status
 */
export type JourneyStatus = 'assigned' | 'in_progress' | 'completed';

/**
 * Base journey interface
 */
export interface Journey {
  id: number;
  name: string;
  description?: string;
  language: LanguageSummary;
  createdBy: UserSummary;
  topics?: TopicInJourney[];
  totalTopics: number;
  totalWords: number;
  progress?: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Journey list item
 */
export interface JourneyListItem {
  id: number;
  name: string;
  description?: string;
  language: LanguageSummary;
  topicCount: number;
  totalWords: number;
  createdBy: UserSummary;
  assignedToCount: number;
  createdAt: string;
}

/**
 * User journey (assigned journey)
 */
export interface UserJourney {
  id: number;
  name: string;
  description?: string;
  language: LanguageSummary;
  topicCount: number;
  completedTopics: number;
  progress: number;
  status: JourneyStatus;
  assignedBy: UserSummary;
  assignedAt: string;
  startedAt?: string;
  currentTopic?: TopicSummary;
}

/**
 * Create journey request
 */
export interface CreateJourneyRequest {
  name: string;
  description?: string;
  languageCode: string;
  topicIds: number[];
}

/**
 * Update journey request
 */
export interface UpdateJourneyRequest {
  name: string;
  description?: string;
  languageCode?: string;
  topicIds: number[];
}

/**
 * Assign journey request
 */
export interface AssignJourneyRequest {
  userIds: number[];
  message?: string;
}

/**
 * Assignment result
 */
export interface AssignmentResult {
  assignedCount: number;
  assignments: AssignmentDetail[];
}

/**
 * Assignment detail
 */
export interface AssignmentDetail {
  userId: number;
  userName: string;
  assignedAt: string;
}

/**
 * Journey filter parameters
 */
export interface JourneyFilterParams extends FilterParams {
  languageCode?: string;
  createdBy?: number;
  assignedTo?: number;
  status?: JourneyStatus;
}

/**
 * Reorder topics request
 */
export interface ReorderTopicsRequest {
  topicIds: number[];
}
```

---

## 6. Quiz Types

### types/quiz.ts

```typescript
import { AchievementSummary } from './achievement';

/**
 * Quiz question types
 */
export type QuestionType = 'translation' | 'listening' | 'image';

/**
 * Quiz answer options
 */
export type AnswerOption = 'A' | 'B' | 'C' | 'D';

/**
 * Quiz question (teacher view with answer)
 */
export interface QuizQuestion {
  id: number;
  questionType: QuestionType;
  questionText: string;
  correctAnswer: AnswerOption;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  wordId?: number;
  createdAt: string;
}

/**
 * Quiz question for learner (no correct answer)
 */
export interface QuizQuestionForLearner {
  id: number;
  questionType: QuestionType;
  questionText: string;
  audioUrl?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

/**
 * Quiz for learner
 */
export interface QuizForLearner {
  topicId: number;
  topicName: string;
  questions: QuizQuestionForLearner[];
  totalQuestions: number;
}

/**
 * Create quiz question request
 */
export interface CreateQuizRequest {
  questionType: QuestionType;
  questionText: string;
  correctAnswer: AnswerOption;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  wordId?: number;
}

/**
 * Quiz answer submission
 */
export interface QuizAnswer {
  questionId: number;
  selectedAnswer: AnswerOption;
}

/**
 * Submit quiz request
 */
export interface SubmitQuizRequest {
  answers: QuizAnswer[];
}

/**
 * Quiz question result
 */
export interface QuizQuestionResult {
  questionId: number;
  correct: boolean;
  selectedAnswer: AnswerOption;
  correctAnswer: AnswerOption;
}

/**
 * Quiz result response
 */
export interface QuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  results: QuizQuestionResult[];
  achievementsEarned?: AchievementSummary[];
}
```

---

## 7. Progress Types

### types/progress.ts

```typescript
/**
 * Activity types
 */
export type ActivityType = 'flashcard' | 'pronunciation' | 'conversation' | 'quiz';

/**
 * User progress entry
 */
export interface UserProgress {
  id: number;
  userId: number;
  topicId?: number;
  journeyId?: number;
  activityType: ActivityType;
  completed: boolean;
  score?: number;
  maxScore?: number;
  timeSpentSeconds: number;
  completedAt?: string;
  createdAt: string;
}

/**
 * Complete activity request
 */
export interface CompleteActivityRequest {
  timeSpentSeconds: number;
}

/**
 * Complete conversation request
 */
export interface CompleteConversationRequest {
  conversationId: number;
  timeSpentSeconds: number;
}

/**
 * Learning session
 */
export interface LearningSession {
  id: number;
  userId: number;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  activitiesCompleted: number;
}

/**
 * Session start response
 */
export interface SessionStartResponse {
  sessionId: string;
  startedAt: string;
}

/**
 * Session end response
 */
export interface SessionEndResponse {
  sessionId: string;
  durationSeconds: number;
  activitiesCompleted: number;
}

/**
 * Journey progress
 */
export interface JourneyProgress {
  journeyId: number;
  journeyName: string;
  progress: number;
  completedTopics: number;
  totalTopics: number;
  timeSpentMinutes: number;
  averageQuizScore: number;
}

/**
 * Recent activity
 */
export interface RecentActivity {
  type: ActivityType;
  topicName: string;
  score?: number;
  completedAt: string;
}

/**
 * Progress response
 */
export interface ProgressResponse {
  journeys: JourneyProgress[];
  recentActivities: RecentActivity[];
}

/**
 * Analytics time range
 */
export type TimeRange = '7days' | '30days' | '90days' | 'all';

/**
 * Teacher analytics request
 */
export interface TeacherAnalyticsParams {
  range?: TimeRange;
  studentId?: number;
}

/**
 * Teacher analytics response
 */
export interface TeacherAnalytics {
  totalStudents: number;
  activeStudents: number;
  totalJourneysAssigned: number;
  averageCompletionRate: number;
  totalContentCreated: number;
  studentProgress: StudentProgressSummary[];
  topPerformers: StudentPerformance[];
  contentUsage: ContentUsageStats[];
}

/**
 * Student progress summary
 */
export interface StudentProgressSummary {
  studentId: number;
  studentName: string;
  journeysAssigned: number;
  journeysCompleted: number;
  averageQuizScore: number;
  totalLearningTimeMinutes: number;
}

/**
 * Student performance
 */
export interface StudentPerformance {
  studentId: number;
  studentName: string;
  profilePicUrl?: string;
  averageScore: number;
  completionRate: number;
}

/**
 * Content usage stats
 */
export interface ContentUsageStats {
  contentType: 'topic' | 'journey' | 'word';
  contentId: number;
  contentName: string;
  usageCount: number;
  averageScore?: number;
}

/**
 * Admin overview
 */
export interface AdminOverview {
  totalUsers: number;
  totalLearners: number;
  totalTeachers: number;
  totalWords: number;
  totalTopics: number;
  totalJourneys: number;
  activeUsersToday: number;
  averageLearningTimePerUser: number;
  topAchievers: TopAchiever[];
  systemHealth: SystemHealth;
}

/**
 * Top achiever
 */
export interface TopAchiever {
  userId: number;
  userName: string;
  achievementsEarned: number;
  totalScore: number;
}

/**
 * System health
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  lastBackup?: string;
}
```

---

## 8. Achievement Types

### types/achievement.ts

```typescript
/**
 * Achievement criteria types
 */
export type CriteriaType =
  | 'topic_complete'
  | 'journey_complete'
  | 'quiz_score'
  | 'streak'
  | 'total_words';

/**
 * Base achievement interface
 */
export interface Achievement {
  id: number;
  name: string;
  description: string;
  badgeIconUrl?: string;
  criteriaType: CriteriaType;
  criteriaValue: number;
  createdAt: string;
}

/**
 * User achievement (earned)
 */
export interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  achievement: Achievement;
  earnedAt: string;
}

/**
 * Achievement summary
 */
export interface AchievementSummary {
  id: number;
  name: string;
  description: string;
  badgeIconUrl?: string;
  earnedAt?: string;
}

/**
 * Achievement with earned status
 */
export interface AchievementWithStatus extends Achievement {
  earned: boolean;
  earnedAt?: string;
  progress: number;
  progressMax: number;
}
```

---

## 9. Bookmark Types

### types/bookmark.ts

```typescript
import { Word } from './word';
import { Topic } from './topic';

/**
 * Bookmark type
 */
export type BookmarkType = 'word' | 'topic';

/**
 * User bookmark
 */
export interface UserBookmark {
  id: number;
  userId: number;
  wordId?: number;
  topicId?: number;
  word?: Word;
  topic?: Topic;
  createdAt: string;
}

/**
 * Create bookmark request
 */
export interface CreateBookmarkRequest {
  wordId?: number;
  topicId?: number;
}

/**
 * Bookmark filter parameters
 */
export interface BookmarkFilterParams extends FilterParams {
  type?: BookmarkType;
}
```

---

## 10. Note Types

### types/note.ts

```typescript
import { Word } from './word';

/**
 * User note
 */
export interface UserNote {
  id: number;
  userId: number;
  wordId: number;
  noteText: string;
  word: Word;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create note request
 */
export interface CreateNoteRequest {
  wordId: number;
  noteText: string;
}

/**
 * Update note request
 */
export interface UpdateNoteRequest {
  noteText: string;
}

/**
 * Note filter parameters
 */
export interface NoteFilterParams extends FilterParams {
  wordId?: number;
}
```

---

## 11. SRS (Spaced Repetition System) Types

### types/srs.ts

```typescript
import { Word } from './word';

/**
 * SRS item (spaced repetition item)
 */
export interface SRSItem {
  id: number;
  userId: number;
  wordId: number;
  word: Word;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewDate: string;
  lastReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Due review item
 */
export interface DueReviewItem {
  id: number;
  word: Word;
  easeFactor: number;
  repetitions: number;
  lastReviewedAt?: string;
}

/**
 * SRS due reviews response
 */
export interface SRSDueReviews {
  dueCount: number;
  items: DueReviewItem[];
}

/**
 * Submit SRS review request
 */
export interface SubmitSRSReviewRequest {
  srsItemId: number;
  remembered: boolean;
}

/**
 * SRS review result
 */
export interface SRSReviewResult {
  srsItemId: number;
  remembered: boolean;
  newEaseFactor: number;
  newIntervalDays: number;
  nextReviewDate: string;
}

/**
 * SRS statistics
 */
export interface SRSStats {
  totalItems: number;
  dueToday: number;
  dueTomorrow: number;
  dueThisWeek: number;
  masteredWords: number;
  learningWords: number;
  newWords: number;
  averageRetention: number;
}

/**
 * SRS quality rating (0-5 scale for SM-2 algorithm)
 */
export type SRSQuality = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Alternative SRS review request with quality rating
 */
export interface SubmitSRSReviewWithQualityRequest {
  srsItemId: number;
  quality: SRSQuality;
}
```

---

## 12. Index File (Re-exports)

### types/index.ts

```typescript
// API types
export * from './api';

// User types
export * from './user';

// Content types
export * from './word';
export * from './topic';
export * from './journey';

// Learning types
export * from './quiz';
export * from './progress';
export * from './srs';

// Feature types
export * from './achievement';
export * from './bookmark';
export * from './note';

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

/**
 * Generic ID type
 */
export type ID = number;

/**
 * ISO 8601 date string
 */
export type ISODate = string;

/**
 * URL string
 */
export type URL = string;

/**
 * JWT token string
 */
export type JWTToken = string;

/**
 * Generic key-value map
 */
export type Dictionary<T = any> = Record<string, T>;

/**
 * Async operation status
 */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Generic form field
 */
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

/**
 * Generic form state
 */
export type FormState<T> = {
  [K in keyof T]: FormField<T[K]>;
};

/**
 * File upload payload
 */
export interface FileUpload {
  file: File;
  name: string;
  size: number;
  type: string;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Action result
 */
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

## 13. API Service Type Guards

### services/api.ts (Type Guards & Helpers)

```typescript
import { APIResponse, APIError, ErrorCode } from '@/types';

/**
 * Type guard for API response
 */
export function isAPIResponse<T>(obj: any): obj is APIResponse<T> {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.success === 'boolean'
  );
}

/**
 * Type guard for API error
 */
export function isAPIError(obj: any): obj is APIError {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.code === 'string' &&
    typeof obj.message === 'string'
  );
}

/**
 * Extract error message from API response
 */
export function extractErrorMessage(error: any): string {
  if (isAPIError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Check if error is specific code
 */
export function isErrorCode(error: any, code: ErrorCode): boolean {
  return isAPIError(error) && error.code === code;
}

/**
 * Format date to ISO string
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString();
}

/**
 * Parse ISO date string to Date
 */
export function parseISODate(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Build query string from params
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Safe JSON parse
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
```

---

## 14. React Hook Types (Bonus)

### types/hooks.ts

```typescript
import { AsyncStatus } from './index';

/**
 * Async data hook state
 */
export interface UseAsyncState<T> {
  data: T | null;
  status: AsyncStatus;
  error: string | null;
  loading: boolean;
}

/**
 * Async data hook actions
 */
export interface UseAsyncActions<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
  setData: (data: T | null) => void;
}

/**
 * Complete async hook return type
 */
export type UseAsyncReturn<T> = UseAsyncState<T> & UseAsyncActions<T>;

/**
 * Pagination hook state
 */
export interface UsePaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Pagination hook actions
 */
export interface UsePaginationActions {
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setLimit: (limit: number) => void;
  reset: () => void;
}

/**
 * Complete pagination hook return type
 */
export type UsePaginationReturn = UsePaginationState & UsePaginationActions;

/**
 * Form hook field state
 */
export interface UseFormFieldState<T> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

/**
 * Form hook actions
 */
export interface UseFormActions<T> {
  setValue: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  reset: () => void;
  validate: () => boolean;
  handleSubmit: (onSubmit: (data: T) => void | Promise<void>) => Promise<void>;
}

/**
 * Complete form hook return type
 */
export interface UseFormReturn<T> {
  fields: FormState<T>;
  actions: UseFormActions<T>;
  isValid: boolean;
  isSubmitting: boolean;
}

/**
 * Form state type
 */
export type FormState<T> = {
  [K in keyof T]: UseFormFieldState<T[K]>;
};

/**
 * Auth context type
 */
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
}

/**
 * Theme context type
 */
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

---

## 15. Component Prop Types (Bonus)

### types/components.ts

```typescript
import { ReactNode } from 'react';
import { User, Word, Topic, Journey, Quiz } from './index';

/**
 * Base component props
 */
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Card component props
 */
export interface CardProps extends BaseProps {
  title?: string;
  footer?: ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}

/**
 * Button component props
 */
export interface ButtonProps extends BaseProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Input component props
 */
export interface InputProps {
  name: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  value: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

/**
 * Word card props
 */
export interface WordCardProps extends BaseProps {
  word: Word;
  onPlay?: () => void;
  onBookmark?: () => void;
  bookmarked?: boolean;
  showActions?: boolean;
}

/**
 * Topic card props
 */
export interface TopicCardProps extends BaseProps {
  topic: Topic;
  onStart?: () => void;
  progress?: number;
  locked?: boolean;
}

/**
 * Journey card props
 */
export interface JourneyCardProps extends BaseProps {
  journey: Journey;
  onView?: () => void;
  onStart?: () => void;
  progress?: number;
  status?: 'assigned' | 'in_progress' | 'completed';
}

/**
 * Quiz question component props
 */
export interface QuizQuestionProps extends BaseProps {
  question: QuizQuestionForLearner;
  selectedAnswer?: AnswerOption;
  onSelect: (answer: AnswerOption) => void;
  disabled?: boolean;
  showResult?: boolean;
  correctAnswer?: AnswerOption;
}

/**
 * Progress bar props
 */
export interface ProgressBarProps extends BaseProps {
  progress: number;
  total: number;
  color?: string;
  showLabel?: boolean;
}

/**
 * Modal props
 */
export interface ModalProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Table column definition
 */
export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

/**
 * Table props
 */
export interface TableProps<T> extends BaseProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onRowClick?: (record: T) => void;
  pagination?: UsePaginationReturn;
}
```

---

**End of TypeScript Models Documentation**
