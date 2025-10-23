import api from './api';

export interface WordTranslation {
  id: number;
  wordId: number;
  languageId: number;
  translation: string;
  romanization?: string;
  audioUrl?: string;
  language?: {
    id: number;
    code: string;
    name: string;
  };
}

export interface Flashcard {
  id: number;
  baseWord: string;
  imageUrl?: string;
  notes?: string;
  translations: WordTranslation[];
  isBookmarked: boolean;
}

export interface FlashcardResponse {
  topicId: number;
  topicName: string;
  flashcards: Flashcard[];
  total: number;
}

export interface CompleteFlashcardRequest {
  journeyId?: number;
  timeSpentSeconds: number;
}

export interface CompleteFlashcardResponse {
  message: string;
  topicCompleted: boolean;
}

export interface BookmarkResponse {
  bookmarked: boolean;
  message: string;
}

export interface BookmarkedWord {
  id: number;
  baseWord: string;
  imageUrl?: string;
  translations: WordTranslation[];
  bookmarkedAt: string;
}

export interface BookmarksResponse {
  bookmarks: BookmarkedWord[];
  total: number;
}

class FlashcardService {
  /**
   * Get flashcards for a topic
   */
  async getTopicFlashcards(topicId: number): Promise<FlashcardResponse> {
    const response = await api.get<FlashcardResponse>(`/topics/${topicId}/flashcards`);
    return response.data;
  }

  /**
   * Complete flashcard activity
   */
  async completeFlashcardActivity(
    topicId: number,
    data: CompleteFlashcardRequest
  ): Promise<CompleteFlashcardResponse> {
    const response = await api.post<CompleteFlashcardResponse>(`/topics/${topicId}/flashcards/complete`, data);
    return response.data;
  }

  /**
   * Toggle bookmark for a word
   */
  async toggleBookmark(wordId: number): Promise<BookmarkResponse> {
    const response = await api.post<BookmarkResponse>(`/words/${wordId}/bookmark`);
    return response.data;
  }

  /**
   * Get all bookmarked words
   */
  async getBookmarkedWords(): Promise<BookmarksResponse> {
    const response = await api.get<BookmarksResponse>('/bookmarks');
    return response.data;
  }
}

export const flashcardService = new FlashcardService();
