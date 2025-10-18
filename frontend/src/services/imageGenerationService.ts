import api from './api';

export interface GenerateImageRequest {
  word: string;
  translation?: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  customPrompt?: string;
}

export interface GenerateImageResponse {
  url: string;
  local_path: string;
  prompt: string;
  cached: boolean;
}

export interface BatchGenerateImageRequest {
  words: GenerateImageRequest[];
}

export interface BatchGenerateImageResponse {
  images: BatchGenerateResult[];
}

export interface BatchGenerateResult {
  word: string;
  image?: GenerateImageResponse;
  error?: string;
}

/**
 * Generate an AI image for a single word
 */
export const generateImage = async (
  request: GenerateImageRequest
): Promise<GenerateImageResponse> => {
  try {
    const response = await api.post<GenerateImageResponse>(
      '/images/generate',
      request
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Failed to generate image:', error);
    const err = error as { response?: { data?: { error?: string } } };
    throw new Error(
      err.response?.data?.error || 'Failed to generate image'
    );
  }
};

/**
 * Generate AI images for multiple words in batch
 */
export const batchGenerateImages = async (
  request: BatchGenerateImageRequest
): Promise<BatchGenerateImageResponse> => {
  try {
    const response = await api.post<BatchGenerateImageResponse>(
      '/images/generate/batch',
      request
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Failed to generate images in batch:', error);
    const err = error as { response?: { data?: { error?: string } } };
    throw new Error(
      err.response?.data?.error || 'Failed to generate images'
    );
  }
};

export default {
  generateImage,
  batchGenerateImages,
};

