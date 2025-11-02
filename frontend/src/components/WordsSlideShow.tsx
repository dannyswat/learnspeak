import React, { useEffect } from 'react';
import type { TopicWord } from '../types/topic';

interface WordsSlideShowProps {
  words: TopicWord[];
  selectedImageIndex: number | null;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const WordsSlideShow: React.FC<WordsSlideShowProps> = ({
  words,
  selectedImageIndex,
  onClose,
  onPrevious,
  onNext,
}) => {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;

      if (e.key === 'ArrowLeft') {
        onPrevious();
      } else if (e.key === 'ArrowRight') {
        onNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    if (selectedImageIndex !== null) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedImageIndex, onPrevious, onNext, onClose]);

  if (selectedImageIndex === null || !words[selectedImageIndex]) {
    return null;
  }

  const currentWord = words[selectedImageIndex];
  const canGoPrevious = selectedImageIndex > 0;
  const canGoNext = selectedImageIndex < words.length - 1;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white text-3xl sm:text-4xl hover:text-gray-300 transition-colors z-10"
        title="Close (Esc)"
      >
        ×
      </button>

      {/* Previous Button */}
      {canGoPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-2 sm:left-4 text-white text-4xl sm:text-5xl hover:text-gray-300 transition-colors z-10"
          title="Previous (←)"
        >
          ‹
        </button>
      )}

      {/* Next Button */}
      {canGoNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-2 sm:right-4 text-white text-4xl sm:text-5xl hover:text-gray-300 transition-colors z-10"
          title="Next (→)"
        >
          ›
        </button>
      )}

      {/* Image Container */}
      <div
        className="max-w-5xl max-h-[90vh] flex flex-col items-center w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentWord.imageUrl}
          alt={currentWord.baseWord}
          className="max-w-full max-h-[60vh] sm:max-h-[70vh] object-contain rounded-lg shadow-2xl"
        />

        {/* Word Info */}
        <div className="mt-4 sm:mt-6 bg-white rounded-lg p-3 sm:p-4 shadow-xl max-w-md w-full mx-2">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {currentWord.baseWord}
            </div>
            <div className="text-lg sm:text-xl text-gray-700 mb-1">
              {currentWord.translation}
            </div>
            {currentWord.romanization && (
              <div className="text-sm text-gray-500">
                {currentWord.romanization}
              </div>
            )}
            <div className="text-sm text-gray-400 mt-2">
              {selectedImageIndex + 1} / {words.length}
            </div>
          </div>

          {/* Audio Player */}
          {currentWord.audioUrl && (
            <div className="mt-3">
              <audio key={currentWord.audioUrl} controls className="w-full">
                <source src={currentWord.audioUrl} />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>

        {/* Navigation Hint */}
        <div className="mt-2 sm:mt-4 text-white text-xs sm:text-sm text-center opacity-75 px-2">
          <span className="hidden sm:inline">Use arrow keys (← →) or click arrows to navigate • Press Esc to close</span>
          <span className="sm:hidden">Tap arrows to navigate • Tap × to close</span>
        </div>
      </div>
    </div>
  );
};

export default WordsSlideShow;
