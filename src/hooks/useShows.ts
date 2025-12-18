import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useShows(filters?: { status?: string; clientId?: number }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.clientId) params.set('clientId', filters.clientId.toString());

  const url = `/api/shows${params.toString() ? `?${params}` : ''}`;
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return {
    shows: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useShow(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/shows/${id}` : null,
    fetcher
  );

  return {
    show: data,
    isLoading,
    isError: error,
    mutate,
  };
}