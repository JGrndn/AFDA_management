import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useWorkshops(options?: { activeOnly?: boolean; seasonId?: number }) {
  const params = new URLSearchParams();
  if (options?.activeOnly) params.set('activeOnly', 'true');
  if (options?.seasonId) params.set('seasonId', options.seasonId.toString());
  
  const url = `/api/workshops${params.toString() ? `?${params}` : ''}`;
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return {
    workshops: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useWorkshop(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/workshops/${id}` : null,
    fetcher
  );

  return {
    workshop: data,
    isLoading,
    isError: error,
    mutate,
  };
}