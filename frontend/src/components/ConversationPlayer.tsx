import React, { useState, useRef, useEffect } from 'react';
import { uploadService } from '../services/wordService';
import type { Conversation, ConversationLine } from '../types/conversation';

interface ConversationPlayerProps {
  conversation: Conversation;
  onComplete?: () => void;
}

const ConversationPlayer: React.FC<ConversationPlayerProps> = ({ conversation, onComplete }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEnglish, setShowEnglish] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentLine = conversation.lines[currentLineIndex];
  const isLastLine = currentLineIndex === conversation.lines.length - 1;

  // Autoplay effect - plays audio when line changes if autoplay is enabled
  useEffect(() => {
    if (autoplay && currentLine.audioUrl && audioRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        audioRef.current?.play();
        setIsPlaying(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentLineIndex, autoplay, currentLine.audioUrl]);

  const handlePlayAudio = () => {
    if (currentLine.audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    
    // Auto-advance to next line if autoplay is enabled
    if (autoplay) {
      if (!isLastLine) {
        // Delay before advancing to next line
        setTimeout(() => {
          setCurrentLineIndex(currentLineIndex + 1);
        }, 800);
      } else if (onComplete) {
        // If it's the last line, complete the conversation
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    }
  };

  const handleNext = () => {
    if (!isLastLine) {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setCurrentLineIndex(currentLineIndex + 1);
      setIsPlaying(false);
    } else if (onComplete) {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentLineIndex > 0) {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setCurrentLineIndex(currentLineIndex - 1);
      setIsPlaying(false);
    }
  };

  const goToLine = (index: number) => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentLineIndex(index);
    setIsPlaying(false);
  };

  const getSpeakerColor = (speakerRole: string): string => {
    // Simple color assignment based on speaker role
    const colors: { [key: string]: string } = {
      customer: 'bg-blue-100 border-blue-300',
      waiter: 'bg-green-100 border-green-300',
      clerk: 'bg-purple-100 border-purple-300',
      teacher: 'bg-yellow-100 border-yellow-300',
      student: 'bg-pink-100 border-pink-300',
      narrator: 'bg-gray-100 border-gray-300',
    };
    
    const lowerRole = speakerRole.toLowerCase();
    for (const role in colors) {
      if (lowerRole.includes(role)) {
        return colors[role];
      }
    }
    return 'bg-indigo-100 border-indigo-300';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">{conversation.title}</h2>
        {conversation.description && (
          <p className="text-sm sm:text-base text-indigo-100">{conversation.description}</p>
        )}
        {conversation.context && (
          <p className="text-xs sm:text-sm text-indigo-200 mt-2 italic">💡 {conversation.context}</p>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        {/* Autoplay Control */}
        <div className="mb-4 flex items-center justify-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoplay}
              onChange={(e) => setAutoplay(e.target.checked)}
              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">
              🎬 Autoplay
            </span>
          </label>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Line {currentLineIndex + 1} of {conversation.lines.length}</span>
            <span className="text-indigo-600 font-medium">
              {Math.round(((currentLineIndex + 1) / conversation.lines.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentLineIndex + 1) / conversation.lines.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Line Display */}
        <div className={`border-2 rounded-lg p-4 sm:p-6 mb-6 ${getSpeakerColor(currentLine.speakerRole)}`}>
          {/* Speaker Role */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg font-bold">
                {currentLine.speakerRole.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-gray-800">{currentLine.speakerRole}</span>
            </div>
            {currentLine.isLearnerLine && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                ⭐ Your Turn
              </span>
            )}
          </div>

          {/* Image (if available) */}
          {currentLine.imageUrl && (
            <div className="mb-4">
              <img
                src={uploadService.getFileUrl(currentLine.imageUrl)}
                alt={currentLine.englishText}
                className="w-full max-w-md mx-auto rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Text Content */}
          <div className="space-y-3">
            {/* Target Language Text */}
            <div className="bg-white bg-opacity-50 rounded-lg p-3 sm:p-4">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {currentLine.targetText}
              </p>
              {currentLine.romanization && (
                <p className="text-sm sm:text-base text-gray-600 italic">
                  {currentLine.romanization}
                </p>
              )}
            </div>

            {/* English Translation Toggle */}
            <div>
              <button
                onClick={() => setShowEnglish(!showEnglish)}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-2"
              >
                {showEnglish ? '🙈 Hide' : '👁️ Show'} English
              </button>
              {showEnglish && (
                <div className="bg-white bg-opacity-70 rounded-lg p-3">
                  <p className="text-base sm:text-lg text-gray-700">{currentLine.englishText}</p>
                </div>
              )}
            </div>
          </div>

          {/* Audio Playback */}
          {currentLine.audioUrl && (
            <div className="mt-4">
              <audio
                ref={audioRef}
                src={uploadService.getFileUrl(currentLine.audioUrl)}
                onEnded={handleAudioEnded}
                className="hidden"
              />
              <button
                onClick={handlePlayAudio}
                disabled={isPlaying}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {isPlaying ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Playing...
                  </>
                ) : (
                  <>
                    🔊 Play Audio
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handlePrevious}
            disabled={currentLineIndex === 0}
            className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-colors ${
              isLastLine
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isLastLine ? '✓ Complete' : 'Next →'}
          </button>
        </div>

        {/* Line Navigator */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Quick Navigation:</p>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {conversation.lines.map((line: ConversationLine, index: number) => (
              <button
                key={line.id}
                onClick={() => goToLine(index)}
                className={`aspect-square rounded-lg font-medium text-sm transition-all ${
                  index === currentLineIndex
                    ? 'bg-indigo-600 text-white scale-110'
                    : index < currentLineIndex
                    ? 'bg-green-200 text-green-800 hover:bg-green-300'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title={`Line ${index + 1}: ${line.speakerRole}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPlayer;
