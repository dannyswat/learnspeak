import React, { useState } from 'react';
import { uploadService } from '../services/wordService';
import type { TopicWord } from '../types/topic';

interface TopicImagesSelectorButtonProps {
  topicWords: TopicWord[];
  onImageSelected: (imageUrl: string) => void;
  className?: string;
}

const TopicImagesSelectorButton: React.FC<TopicImagesSelectorButtonProps> = ({
  topicWords,
  onImageSelected,
  className = "bg-green-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-600"
}) => {
  const [showImageSelector, setShowImageSelector] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowImageSelector(true)}
        className={className}
      >
        🖼️ Select from Topic Words
      </button>

      {/* Image Selector Modal */}
      {showImageSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Image from Topic Words
              </h3>
              <button
                onClick={() => setShowImageSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              {topicWords.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-2">No words with images found in this topic.</p>
                  <p className="text-sm">Add images to your words first to use them in quiz questions.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {topicWords.map((word) => (
                    <button
                      key={word.id}
                      type="button"
                      onClick={() => {
                        onImageSelected(word.imageUrl);
                        setShowImageSelector(false);
                      }}
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-green-500 transition-all hover:shadow-lg"
                    >
                      <img
                        src={uploadService.getFileUrl(word.imageUrl)}
                        alt={word.baseWord}
                        className="w-full h-full object-cover"
                      />
                      {/* Bottom gradient label - always visible */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pointer-events-none">
                        <p className="text-white text-xs font-medium truncate">
                          {word.baseWord}
                        </p>
                      </div>
                      {/* Hover overlay with translation */}
                      {word.translation && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                          <div className="text-white text-center">
                            <p className="font-semibold text-sm mb-1">{word.baseWord}</p>
                            <p className="text-xs">{word.translation}</p>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowImageSelector(false)}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopicImagesSelectorButton;
