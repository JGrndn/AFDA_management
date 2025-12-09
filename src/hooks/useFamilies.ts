import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useFamilies() {
  const { data, error, isLoading, mutate } = useSWR('/api/families', fetcher);

  return {
    families: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useFamily(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/families/${id}` : null,
    fetcher
  );

  return {
    family: data,
    isLoading,
    isError: error,
    mutate,
  };
}