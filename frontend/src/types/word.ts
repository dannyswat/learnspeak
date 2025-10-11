// Word and translation types

export interface Language {
  id: number;
  code: string;
  name: string;
  nativeName: string;
}

export interface Translation {
  id: number;
  wordId: number;
  languageId: number;
  translation: string;
  romanization: string;
  audioUrl: string;
  language?: Language;
}

export interface Word {
  id: number;
  baseWord: string;
  imageUrl: string;
  notes: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  translations: Translation[];
}

export interface CreateTranslationInput {
  languageId: number;
  translation: string;
  romanization?: string;
  audioUrl?: string;
}

export interface CreateWordRequest {
  baseWord: string;
  imageUrl?: string;
  notes?: string;
  translations: CreateTranslationInput[];
}

export interface UpdateTranslationInput {
  id?: number;
  languageId: number;
  translation: string;
  romanization?: string;
  audioUrl?: string;
}

export interface UpdateWordRequest {
  baseWord?: string;
  imageUrl?: string;
  notes?: string;
  translations?: UpdateTranslationInput[];
}

export interface WordListResponse {
  words: Word[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface WordFilterParams {
  search?: string;
  languageId?: number;
  createdBy?: number;
  page?: number;
  pageSize?: number;
}

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}
