import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useShowClients() {
  const { data, error, isLoading, mutate } = useSWR('/api/shows/clients', fetcher);

  return {
    clients: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useShowClient(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/shows/clients/${id}` : null,
    fetcher
  );

  return {
    client: data,
    isLoading,
    isError: error,
    mutate,
  };
}