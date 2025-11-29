import { useState, useEffect, useRef, useCallback } from 'react';

export interface AutoSaveOptions {
  /** Delay in milliseconds before auto-saving (default: 1000ms) */
  debounceMs?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
}

export interface AutoSaveResult<T> {
  /** The current data state */
  data: T;
  /** Update the data (triggers auto-save after debounce) */
  setData: (newData: T | ((prev: T) => T)) => void;
  /** Whether data is currently being loaded from localStorage */
  isLoading: boolean;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** The last time data was auto-saved */
  lastSaved: Date | null;
  /** Manually save data immediately */
  saveNow: () => void;
  /** Clear all saved data from localStorage */
  clearSaved: () => void;
  /** Whether there is saved data in localStorage */
  hasSavedData: boolean;
}

/**
 * A React hook for auto-saving data to localStorage with debouncing.
 * 
 * Features:
 * - Automatic debounced saving to localStorage
 * - Loads saved data on initial mount
 * - Tracks dirty state (unsaved changes)
 * - Provides last saved timestamp
 * - Manual save and clear functions
 * 
 * @param key - The localStorage key to use for storing data
 * @param initialData - The initial data to use if no saved data exists
 * @param options - Configuration options for auto-save behavior
 * @returns AutoSaveResult object with data, setters, and state indicators
 * 
 * @example
 * ```tsx
 * const { data, setData, isDirty, lastSaved } = useAutoSave(
 *   'my-form-data',
 *   { name: '', email: '' },
 *   { debounceMs: 500 }
 * );
 * 
 * // Update data - will auto-save after 500ms of inactivity
 * setData({ ...data, name: 'John' });
 * 
 * // Or use functional update
 * setData(prev => ({ ...prev, email: 'john@example.com' }));
 * ```
 */
export const useAutoSave = <T>(
  key: string,
  initialData: T,
  options: AutoSaveOptions = {}
): AutoSaveResult<T> => {
  const { debounceMs = 1000, enabled = true } = options;

  // State
  const [data, setDataState] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasSavedData, setHasSavedData] = useState(false);

  // Refs for debouncing and tracking
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializedRef = useRef(false);
  const dataRef = useRef<T>(data);

  // Keep dataRef in sync
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const parsed = JSON.parse(savedData) as T;
        setDataState(parsed);
        setHasSavedData(true);
      }
    } catch (error) {
      console.error(`[useAutoSave] Error loading data from localStorage key "${key}":`, error);
    } finally {
      setIsLoading(false);
      isInitializedRef.current = true;
    }
  }, [key]);

  // Save to localStorage function
  const saveToStorage = useCallback((dataToSave: T) => {
    try {
      const serialized = JSON.stringify(dataToSave);
      localStorage.setItem(key, serialized);
      setLastSaved(new Date());
      setIsDirty(false);
      setHasSavedData(true);
    } catch (error) {
      console.error(`[useAutoSave] Error saving data to localStorage key "${key}":`, error);
    }
  }, [key]);

  // Debounced save function
  const debouncedSave = useCallback((dataToSave: T) => {
    if (!enabled) return;

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set dirty state immediately
    setIsDirty(true);

    // Schedule save
    debounceTimerRef.current = setTimeout(() => {
      saveToStorage(dataToSave);
    }, debounceMs);
  }, [enabled, debounceMs, saveToStorage]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Set data function that triggers auto-save
  const setData = useCallback((newData: T | ((prev: T) => T)) => {
    setDataState(prevData => {
      const resolvedData = typeof newData === 'function' 
        ? (newData as (prev: T) => T)(prevData) 
        : newData;
      
      // Only trigger auto-save after initial load
      if (isInitializedRef.current) {
        debouncedSave(resolvedData);
      }
      
      return resolvedData;
    });
  }, [debouncedSave]);

  // Manual save function
  const saveNow = useCallback(() => {
    // Clear any pending debounced save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    saveToStorage(dataRef.current);
  }, [saveToStorage]);

  // Clear saved data function
  const clearSaved = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setHasSavedData(false);
      setLastSaved(null);
      setIsDirty(false);
      
      // Clear any pending save
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    } catch (error) {
      console.error(`[useAutoSave] Error clearing localStorage key "${key}":`, error);
    }
  }, [key]);

  return {
    data,
    setData,
    isLoading,
    isDirty,
    lastSaved,
    saveNow,
    clearSaved,
    hasSavedData,
  };
};

/**
 * A simpler version that only auto-saves when content exists.
 * Useful for forms where empty data shouldn't be saved.
 */
export const useAutoSaveWithValidation = <T>(
  key: string,
  initialData: T,
  hasContent: (data: T) => boolean,
  options: AutoSaveOptions = {}
): AutoSaveResult<T> => {
  const result = useAutoSave(key, initialData, { ...options, enabled: false });
  
  const { debounceMs = 1000 } = options;
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef<T>(result.data);

  useEffect(() => {
    dataRef.current = result.data;
  }, [result.data]);

  // Custom setData that validates before saving
  const setDataWithValidation = useCallback((newData: T | ((prev: T) => T)) => {
    result.setData(prevData => {
      const resolvedData = typeof newData === 'function'
        ? (newData as (prev: T) => T)(prevData)
        : newData;

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Only save if content exists
      if (hasContent(resolvedData)) {
        debounceTimerRef.current = setTimeout(() => {
          try {
            localStorage.setItem(key, JSON.stringify(resolvedData));
          } catch (error) {
            console.error(`[useAutoSaveWithValidation] Error saving:`, error);
          }
        }, debounceMs);
      }

      return resolvedData;
    });
  }, [result, key, debounceMs, hasContent]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    ...result,
    setData: setDataWithValidation,
  };
};

export default useAutoSave;
