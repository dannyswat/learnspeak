import React, { useState } from 'react';
import { uploadService } from '../services/wordService';
import imageGenerationService from '../services/imageGenerationService';

interface ImageInputProps {
  value: string;
  onChange: (url: string) => void;
  onGenerateImage?: () => Promise<{ word: string; translation?: string }>;
  label?: string;
  showGenerateButton?: boolean;
  disabled?: boolean;
}

const ImageInput: React.FC<ImageInputProps> = ({
  value,
  onChange,
  onGenerateImage,
  label = 'Image',
  showGenerateButton = true,
  disabled = false,
}) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const response = await uploadService.uploadImage(file);
      onChange(response.url);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!onGenerateImage) return;

    try {
      setGeneratingImage(true);
      const { word, translation } = await onGenerateImage();

      if (!word) {
        alert('Please enter a word first');
        return;
      }

      const result = await imageGenerationService.generateImage({
        word,
        translation: translation || '',
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
      });

      // Use the local path if available, otherwise use the URL
      onChange(result.local_path || result.url);

    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to generate image');
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 flex items-center space-x-4">
        {value && (
          <img
            src={uploadService.getFileUrl(value)}
            alt={label}
            className="h-20 w-20 object-cover rounded"
          />
        )}
        <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
          {uploadingImage ? 'Uploading...' : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImage || disabled}
            className="sr-only"
          />
        </label>
        {showGenerateButton && onGenerateImage && (
          <button
            type="button"
            onClick={handleGenerateImage}
            disabled={generatingImage || disabled}
            className="py-2 px-3 border border-purple-300 rounded-md shadow-sm text-sm leading-4 font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingImage ? '🎨 Generating...' : '🎨 Generate Image'}
          </button>
        )}
        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-sm text-red-600 hover:text-red-500"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageInput;
