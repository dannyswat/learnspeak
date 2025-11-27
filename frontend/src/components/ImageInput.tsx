import React, { useState } from 'react';
import { uploadService } from '../services/wordService';
import imageGenerationService from '../services/imageGenerationService';
import ImageBrowser from './ImageBrowser';

interface ImageInputProps {
  value: string;
  onChange: (url: string) => void;
  onGenerateImage?: () => Promise<{ word: string; translation?: string }>;
  label?: string;
  showGenerateButton?: boolean;
  disabled?: boolean;
  allowSelection?: boolean;
}

const ImageInput: React.FC<ImageInputProps> = ({
  value,
  onChange,
  onGenerateImage,
  label = 'Image',
  showGenerateButton = true,
  disabled = false,
  allowSelection = false,
}) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showImageBrowser, setShowImageBrowser] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const response = await uploadService.uploadImage(file);
      // Add cache buster to force browser to reload the newly uploaded image
      onChange(uploadService.addCacheBuster(response.url));
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGenerateImage = async (useCustomPrompt: boolean = false) => {
    if (!onGenerateImage) return;

    try {
      setGeneratingImage(true);
      const { word, translation } = await onGenerateImage();

      if (!word && !useCustomPrompt) {
        alert('Please enter a word first');
        return;
      }

      const requestData: {
        word: string;
        translation?: string;
        size?: '1024x1024' | '1792x1024' | '1024x1792';
        quality?: 'standard' | 'hd';
        style?: 'vivid' | 'natural';
        customPrompt?: string;
      } = {
        word: word || 'placeholder',
        translation: translation || '',
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
      };

      // If using custom prompt, add it to the request
      if (useCustomPrompt && customPrompt.trim()) {
        requestData.customPrompt = customPrompt.trim();
      }

      const result = await imageGenerationService.generateImage(requestData);

      // Use the local path if available, otherwise use the URL
      // Add cache buster to force browser to reload the image
      const imagePath = result.local_path || result.url;
      onChange(uploadService.addCacheBuster(imagePath));

      // Reset custom prompt state after successful generation
      if (useCustomPrompt) {
        setCustomPrompt('');
        setShowCustomPrompt(false);
      }

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
        {!value && (
          <>
            <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {uploadingImage ? 'Uploading...' : 'Upload Image'}
              <input
                type="file"
                accept="image/*, .jpg, .jpeg, .png, .gif, .webp"
                onChange={handleImageUpload}
                disabled={uploadingImage || disabled}
                className="sr-only"
              />
            </label>
            {allowSelection && (
              <button
                type="button"
                onClick={() => setShowImageBrowser(true)}
                disabled={disabled}
                className="py-2 px-3 border border-blue-300 rounded-md shadow-sm text-sm leading-4 font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📁 Browse
              </button>
            )}
            {showGenerateButton && onGenerateImage && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleGenerateImage(false)}
                  disabled={generatingImage || disabled}
                  className="py-2 px-3 border border-purple-300 rounded-md shadow-sm text-sm leading-4 font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingImage ? '🎨 Generating...' : '🎨 Generate Image'}
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCustomPrompt(!showCustomPrompt)}
                    disabled={generatingImage || disabled}
                    className="py-2 px-2 border border-purple-300 rounded-md shadow-sm text-sm leading-4 font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate with custom prompt"
                  >
                    ⋯
                  </button>
                  {showCustomPrompt && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Prompt
                    </label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Enter your custom image generation prompt..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      disabled={generatingImage}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will override the default educational prompt
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomPrompt(false);
                        setCustomPrompt('');
                      }}
                      className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                      disabled={generatingImage}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateImage(true)}
                      disabled={generatingImage || !customPrompt.trim()}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingImage ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
          </>
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

      {/* Image Browser Modal */}
      <ImageBrowser
        isOpen={showImageBrowser}
        onClose={() => setShowImageBrowser(false)}
        onSelect={onChange}
      />
    </div>
  );
};

export default ImageInput;
