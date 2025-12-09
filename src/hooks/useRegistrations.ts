import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useRegistrations(seasonId?: number) {
  const url = seasonId
    ? `/api/registrations?seasonId=${seasonId}`
    : '/api/registrations';
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return {
    registrations: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useRegistration(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/registrations/${id}` : null,
    fetcher
  );

  return {
    registration: data,
    isLoading,
    isError: error,
    mutate,
  };
}