import api from './api';

export interface ImageItem {
  filename: string;
  url: string;
  size: number;
  modTime: number;
}

export interface ImageListResponse {
  images: ImageItem[];
  total: number;
  page: number;
  pages: number;
}

const imageGalleryService = {
  /**
   * Get paginated list of all uploaded images
   * @param page - Page number (1-indexed)
   * @param pageSize - Items per page (default: 20, max: 100)
   */
  async getImages(page: number = 1, pageSize: number = 20): Promise<ImageListResponse> {
    const response = await api.get<ImageListResponse>('/upload/images', {
      params: {
        page,
        pageSize: Math.min(pageSize, 100),
      },
    });
    return response.data;
  },
};

export default imageGalleryService;
