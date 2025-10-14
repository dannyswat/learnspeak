import api from './api';

export interface TranslateRequest {
  text: string;
  fromLang?: string;
  toLang?: string;
  suggestion?: boolean;
}

export interface BatchTranslateRequest {
  texts: string[];
  fromLang?: string;
  toLang?: string;
}

export interface TranslationResult {
  text: string;
  translation: string;
  detectedLanguage?: string;
  alternatives?: string[];
  cached: boolean;
}

export interface BatchTranslationResult {
  results: TranslationResult[];
  total: number;
  cached: number;
}

class TranslationService {
  /**
   * Translate a single text
   */
  async translate(request: TranslateRequest): Promise<TranslationResult> {
    const response = await api.post<TranslationResult>('/translate', request);
    return response.data;
  }

  /**
   * Translate multiple texts in batch
   */
  async translateBatch(request: BatchTranslateRequest): Promise<BatchTranslationResult> {
    const response = await api.post<BatchTranslationResult>('/translate/batch', request);
    return response.data;
  }
}

export default new TranslationService();
