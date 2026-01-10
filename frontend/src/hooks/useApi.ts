import { useState, useCallback, useRef, useEffect } from 'react';

export type ApiState<T> = {
  data: T | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
};

export type UseApiOptions = {
  initialLoad?: boolean;
};

export function useApi<T>(
  fetchFn: () => Promise<T>,
  options: UseApiOptions = { initialLoad: true }
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: options.initialLoad ?? true,
    isRefreshing: false,
    error: null,
  });

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const execute = useCallback(async (isRefresh = false) => {
    if (!isMounted.current) return;

    setState(prev => ({
      ...prev,
      isLoading: !isRefresh && !prev.data,
      isRefreshing: isRefresh,
      error: null,
    }));

    try {
      const data = await fetchFn();
      if (isMounted.current) {
        setState({
          data,
          isLoading: false,
          isRefreshing: false,
          error: null,
        });
      }
      return data;
    } catch (err) {
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error: err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd',
        }));
      }
      throw err;
    }
  }, [fetchFn]);

  const refresh = useCallback(() => execute(true), [execute]);

  const setData = useCallback((data: T | ((prev: T | null) => T)) => {
    setState(prev => ({
      ...prev,
      data: typeof data === 'function' ? (data as (prev: T | null) => T)(prev.data) : data,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    refresh,
    setData,
    reset,
  };
}

// Hook for mutation operations (create, update, delete)
export function useMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const mutate = useCallback(async (input: TInput): Promise<TOutput> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mutationFn(input);
      if (isMounted.current) {
        setIsLoading(false);
      }
      return result;
    } catch (err) {
      if (isMounted.current) {
        const errorMessage = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd';
        setError(errorMessage);
        setIsLoading(false);
      }
      throw err;
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    mutate,
    isLoading,
    error,
    reset,
  };
}
