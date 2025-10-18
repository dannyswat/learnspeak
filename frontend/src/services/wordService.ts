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
    const response = await api.get<Language[]>('/languages');
    return response.data;
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
  getFileUrl(path: string, bustCache: boolean = false): string {
    if (!path) return '';
    
    let url = path;
    if (!path.startsWith('http://') && !path.startsWith('https://')) {
      // In development with Vite proxy, or production, just use the path directly
      // The Vite proxy will forward /uploads requests to the backend
      url = path;
    }
    
    // Add cache-busting timestamp if requested
    if (bustCache) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}t=${Date.now()}`;
    }
    
    return url;
  },

  // Add cache-busting timestamp to any URL
  addCacheBuster(url: string): string {
    if (!url) return '';
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  },
};
