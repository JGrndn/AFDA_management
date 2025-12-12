import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function usePayments(options?: {
  familyId?: number;
  memberId?: number;
  seasonId?: number;
  status?: string;
  uncashedOnly?: boolean;
}) {
  const params = new URLSearchParams();
  if (options?.familyId) params.set('familyId', options.familyId.toString());
  if (options?.memberId) params.set('memberId', options.memberId.toString());
  if (options?.seasonId) params.set('seasonId', options.seasonId.toString());
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

export function usePaymentStatus(options: {
  familyId?: number;
  memberId?: number;
  seasonId?: number;
}) {
  const params = new URLSearchParams();
  if (options.familyId) params.set('familyId', options.familyId.toString());
  if (options.memberId) params.set('memberId', options.memberId.toString());
  if (options.seasonId) params.set('seasonId', options.seasonId.toString());

  console.log(options);

  const url = `/api/payments/status?${params}`;
  const { data, error, isLoading, mutate } = useSWR(
    options.familyId || options.memberId ? url : null,
    fetcher
  );

  return {
    status: data,
    isLoading,
    isError: error,
    mutate,
  };
}