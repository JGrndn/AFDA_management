import { useState } from 'react';

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async <T,>(
    promise: Promise<Response>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await promise;
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'An error occurred');
      }

      const data = await response.json();
      return data as T;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    execute,
    isLoading,
    error,
    setError,
  };
}