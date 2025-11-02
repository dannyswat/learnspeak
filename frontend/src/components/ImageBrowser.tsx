import React, { useState, useEffect, useCallback } from 'react';
import imageGalleryService, { type ImageItem } from '../services/imageGalleryService';
import { uploadService } from '../services/wordService';

interface ImageBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

const ImageBrowser: React.FC<ImageBrowserProps> = ({ isOpen, onClose, onSelect }) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadImages = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await imageGalleryService.getImages(pageNum, pageSize);
      setImages(response.images);
      setTotalPages(response.pages);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load images:', err);
      setError('Failed to load images');
      setImages([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    if (isOpen) {
      loadImages(1);
    }
  }, [isOpen, loadImages]);

  const handleImageClick = (url: string) => {
    onSelect(uploadService.addCacheBuster(url));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Browse Images</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {loading && images.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-gray-600">Loading images...</p>
              </div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No images found</p>
            </div>
          ) : (
            <>
              {/* Image Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {images.map((image) => (
                  <button
                    key={image.filename}
                    type="button"
                    onClick={() => handleImageClick(image.url)}
                    className={`relative group rounded-lg overflow-hidden aspect-square cursor-pointer transition-all hover:ring-2 hover:ring-gray-300`}
                  >
                    <img
                      src={uploadService.getFileUrl(image.url)}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                      }}
                    />
                    <div className="absolute inset-0 group-hover:bg-black group-hover:bg-opacity-20 transition-all pointer-events-none" />
                  </button>
                ))}
              </div>

            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 p-6 flex justify-between items-center">
            <button
              type="button"
              onClick={() => loadImages(page - 1)}
              disabled={page === 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <div className="text-sm text-gray-600">
              Page <span className="font-semibold">{page}</span> of{' '}
              <span className="font-semibold">{totalPages}</span>
            </div>

            <button
              type="button"
              onClick={() => loadImages(page + 1)}
              disabled={page === totalPages || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ImageBrowser;
