import { useState, useEffect, useCallback } from 'react';
import { CacheService } from '@/services/cacheService';

interface UseCachedApiOptions<T> {
  cacheKey: string;
  ttl?: number; // Time to live in milliseconds
  enabled?: boolean; // Whether the API call should be made
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseCachedApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

export function useCachedApi<T>(
  apiCall: () => Promise<T>,
  options: UseCachedApiOptions<T>
): UseCachedApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { cacheKey, ttl, enabled = true, onSuccess, onError } = options;

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Check cache first (unless force refresh)
    if (!forceRefresh && CacheService.has(cacheKey)) {
      const cachedData = CacheService.get<T>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setError(null);
        onSuccess?.(cachedData);
        return;
      }
    }

    // Make API call
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      
      // Cache the result
      CacheService.set(cacheKey, result, ttl);
      
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [apiCall, cacheKey, ttl, onSuccess, onError]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  const clearCache = useCallback(() => {
    CacheService.delete(cacheKey);
  }, [cacheKey]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
  };
}

// Hook for multiple API calls with different cache keys
export function useCachedApiMultiple<T>(
  apiCalls: Array<{
    key: string;
    call: () => Promise<T>;
    ttl?: number;
  }>,
  options: {
    enabled?: boolean;
    onSuccess?: (results: Record<string, T>) => void;
    onError?: (errors: Record<string, Error>) => void;
  } = {}
): {
  data: Record<string, T | null>;
  loading: Record<string, boolean>;
  errors: Record<string, Error | null>;
  refetch: (key?: string) => Promise<void>;
  clearCache: (key?: string) => void;
} {
  const [data, setData] = useState<Record<string, T | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, Error | null>>({});

  const { enabled = true, onSuccess, onError } = options;

  const fetchData = useCallback(async (key?: string, forceRefresh = false) => {
    const callsToMake = key 
      ? apiCalls.filter(call => call.key === key)
      : apiCalls;

    for (const { key: callKey, call, ttl } of callsToMake) {
      // Check cache first (unless force refresh)
      if (!forceRefresh && CacheService.has(callKey)) {
        const cachedData = CacheService.get<T>(callKey);
        if (cachedData) {
          setData(prev => ({ ...prev, [callKey]: cachedData }));
          setErrors(prev => ({ ...prev, [callKey]: null }));
          continue;
        }
      }

      // Make API call
      setLoading(prev => ({ ...prev, [callKey]: true }));
      setErrors(prev => ({ ...prev, [callKey]: null }));

      try {
        const result = await call();
        
        // Cache the result
        CacheService.set(callKey, result, ttl);
        
        setData(prev => ({ ...prev, [callKey]: result }));
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setErrors(prev => ({ ...prev, [callKey]: error }));
      } finally {
        setLoading(prev => ({ ...prev, [callKey]: false }));
      }
    }

    // Call success/error callbacks
    const currentData = { ...data };
    const currentErrors = { ...errors };
    
    if (onSuccess && Object.keys(currentData).length > 0) {
      onSuccess(currentData as Record<string, T>);
    }
    
    if (onError && Object.keys(currentErrors).length > 0) {
      onError(currentErrors as Record<string, Error>);
    }
  }, [apiCalls, data, errors, onSuccess, onError]);

  const refetch = useCallback((key?: string) => fetchData(key, true), [fetchData]);

  const clearCache = useCallback((key?: string) => {
    if (key) {
      CacheService.delete(key);
    } else {
      apiCalls.forEach(({ key: callKey }) => CacheService.delete(callKey));
    }
  }, [apiCalls]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  return {
    data,
    loading,
    errors,
    refetch,
    clearCache,
  };
} 