import api from './api';
import type {
  Word,
  CreateWordRequest,
  UpdateWordRequest,
  WordListResponse,
  WordFilterParams,
  UploadResponse,
  Language,
} from '../types/word';

// Word CRUD operations
export const wordService = {
  // Get all words with filtering
  async getWords(params?: WordFilterParams): Promise<WordListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.languageId) queryParams.append('languageId', params.languageId.toString());
    if (params?.createdBy) queryParams.append('createdBy', params.createdBy.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const url = `/words${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<WordListResponse>(url);
    return response.data;
  },

  // Get a single word by ID
  async getWord(id: number): Promise<Word> {
    const response = await api.get<Word>(`/words/${id}`);
    return response.data;
  },

  // Create a new word
  async createWord(data: CreateWordRequest): Promise<Word> {
    const response = await api.post<Word>('/words', data);
    return response.data;
  },

  // Update an existing word
  async updateWord(id: number, data: UpdateWordRequest): Promise<Word> {
    const response = await api.put<Word>(`/words/${id}`, data);
    return response.data;
  },

  // Delete a word
  async deleteWord(id: number): Promise<void> {
    await api.delete(`/words/${id}`);
  },

  // Get all languages
  async getLanguages(): Promise<Language[]> {
    // For now, return mock data since we don't have a languages endpoint yet
    // TODO: Create a languages endpoint in the backend
    return [
      { id: 1, code: 'en', name: 'English', nativeName: 'English' },
      { id: 2, code: 'es', name: 'Spanish', nativeName: 'Español' },
      { id: 3, code: 'fr', name: 'French', nativeName: 'Français' },
      { id: 4, code: 'de', name: 'German', nativeName: 'Deutsch' },
      { id: 5, code: 'it', name: 'Italian', nativeName: 'Italiano' },
      { id: 6, code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { id: 7, code: 'zh', name: 'Chinese', nativeName: '中文' },
    ];
  },
};

// File upload operations
export const uploadService = {
  // Upload audio file
  async uploadAudio(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/upload/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload image file
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get full URL for an uploaded file
  getFileUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Prepend API base URL
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    return `${baseURL}${path}`;
  },
};
