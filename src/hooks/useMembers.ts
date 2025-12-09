import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useMembers(search?: string) {
  const url = search ? `/api/members?search=${encodeURIComponent(search)}` : '/api/members';
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return {
    members: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useMember(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/members/${id}` : null,
    fetcher
  );

  return {
    member: data,
    isLoading,
    isError: error,
    mutate,
  };
}