import { useState, useEffect } from 'react';
import { wordService } from '../services/wordService';
import type { Language } from '../types/word';

/**
 * Custom hook to fetch and manage languages
 * @returns Languages array, loading state, and error state
 */
export const useLanguages = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await wordService.getLanguages();
        setLanguages(data);
      } catch (err) {
        console.error('Failed to load languages:', err);
        setError('Failed to load languages');
      } finally {
        setLoading(false);
      }
    };

    loadLanguages();
  }, []);

  return {
    languages,
    loading,
    error,
  };
};
