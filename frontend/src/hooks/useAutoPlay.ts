import { useState, useCallback } from 'react';

interface AudioItem {
  audioUrl?: string;
}

/**
 * Custom hook for auto-playing audio files sequentially
 * Manages playing state and current index
 * 
 * @returns Object containing autoPlaying state, currentPlayingIndex, play function, and stop function
 */
export const useAutoPlay = () => {
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number>(-1);

  const play = useCallback(async <T extends AudioItem>(items: T[], delayMs: number = 500) => {
    const itemsWithAudio = items.filter(item => item.audioUrl);
    
    if (itemsWithAudio.length === 0) {
      alert('No audio files available to play. Generate audio first.');
      return;
    }

    setAutoPlaying(true);
    
    for (let i = 0; i < items.length; i++) {
      if (!items[i].audioUrl) continue;
      
      setCurrentPlayingIndex(i);
      
      try {
        const audio = new Audio(items[i].audioUrl);
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve();
          audio.onerror = () => reject(new Error('Audio playback failed'));
          audio.play().catch(reject);
        });
        
        // Wait between each audio
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } catch (err) {
        console.error('Error playing audio:', err);
      }
    }
    
    setAutoPlaying(false);
    setCurrentPlayingIndex(-1);
  }, []);

  const stop = useCallback(() => {
    setAutoPlaying(false);
    setCurrentPlayingIndex(-1);
  }, []);

  return {
    autoPlaying,
    currentPlayingIndex,
    play,
    stop,
  };
};
