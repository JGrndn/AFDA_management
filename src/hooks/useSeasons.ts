import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useSeasons() {
  const { data, error, isLoading, mutate } = useSWR('/api/seasons', fetcher);

  return {
    seasons: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSeason(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/seasons/${id}` : null,
    fetcher
  );

  return {
    season: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useActiveSeason() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/seasons/active',
    fetcher
  );

  return {
    season: data,
    isLoading,
    isError: error,
    mutate,
  };
}