import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing data in localStorage with TypeScript support
 * Automatically loads data on initial mount and provides a method to save data
 * 
 * @template T - The type of data to store
 * @param key - The localStorage key to use
 * @returns Object containing data, loading state, saveToLocalStorage method, and clearLocalStorage method
 */
export const useLocalStorage = <T>(key: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on initial mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        const parsed = JSON.parse(storedData) as T;
        setData(parsed);
      }
    } catch (error) {
      console.error(`Error loading data from localStorage key "${key}":`, error);
    } finally {
      setLoading(false);
    }
  }, [key]);

  // Save data to localStorage
  const saveToLocalStorage = useCallback((dataToSave: T) => {
    try {
      const serialized = JSON.stringify(dataToSave);
      localStorage.setItem(key, serialized);
      setData(dataToSave);
    } catch (error) {
      console.error(`Error saving data to localStorage key "${key}":`, error);
    }
  }, [key]);

  // Clear data from localStorage
  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setData(null);
    } catch (error) {
      console.error(`Error clearing localStorage key "${key}":`, error);
    }
  }, [key]);

  return {
    data,
    loading,
    saveToLocalStorage,
    clearLocalStorage,
  };
};
