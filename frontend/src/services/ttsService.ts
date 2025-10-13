import api from './api';

export interface TTSRequest {
  text: string;
  language?: string;
  voice?: string;
}

export interface TTSResponse {
  audioUrl: string;
  cached: boolean;
  duration?: number;
}

class TTSService {
  /**
   * Generate audio from text using Azure TTS
   */
  async generateAudio(request: TTSRequest): Promise<TTSResponse> {
    const response = await api.post<TTSResponse>('/tts/generate', request);
    return response.data;
  }
}

export default new TTSService();
