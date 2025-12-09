import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function usePayments(options?: { status?: string; uncashedOnly?: boolean }) {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.uncashedOnly) params.set('uncashedOnly', 'true');
  
  const url = `/api/payments${params.toString() ? `?${params}` : ''}`;
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return {
    payments: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function usePayment(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/payments/${id}` : null,
    fetcher
  );

  return {
    payment: data,
    isLoading,
    isError: error,
    mutate,
  };
}