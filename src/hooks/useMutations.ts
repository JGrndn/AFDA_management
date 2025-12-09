import { useApi } from './useApi';

export function useSeasonMutations() {
  const api = useApi();

  const createSeason = async (data: any) => {
    return api.execute(
      fetch('/api/seasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  };

  const updateSeason = async (id: number, data: any) => {
    return api.execute(
      fetch(`/api/seasons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  };

  const deleteSeason = async (id: number) => {
    return api.execute(
      fetch(`/api/seasons/${id}`, { method: 'DELETE' })
    );
  };

  return {
    createSeason,
    updateSeason,
    deleteSeason,
    isLoading: api.isLoading,
    error: api.error,
  };
}

export function useMemberMutations() {
  const api = useApi();

  const createMember = async (data: any) => {
    return api.execute(
      fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  };

  const updateMember = async (id: number, data: any) => {
    return api.execute(
      fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  };

  const deleteMember = async (id: number) => {
    return api.execute(
      fetch(`/api/members/${id}`, { method: 'DELETE' })
    );
  };

  return {
    createMember,
    updateMember,
    deleteMember,
    isLoading: api.isLoading,
    error: api.error,
  };
}

export function useRegistrationMutations() {
  const api = useApi();

  const createRegistration = async (data: {
    memberId: number;
    seasonId: number;
    workshopIds: number[];
    familyOrder?: number;
  }) => {
    return api.execute(
      fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  };

  const updateRegistration = async (id: number, data: any) => {
    return api.execute(
      fetch(`/api/registrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  };

  const deleteRegistration = async (id: number) => {
    return api.execute(
      fetch(`/api/registrations/${id}`, { method: 'DELETE' })
    );
  };

  const updateWorkshops = async (
    registrationId: number,
    workshopIds: number[],
    familyOrder: number
  ) => {
    return api.execute(
      fetch(`/api/registrations/${registrationId}/workshops`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workshopIds, familyOrder }),
      })
    );
  };

  return {
    createRegistration,
    updateRegistration,
    deleteRegistration,
    updateWorkshops,
    isLoading: api.isLoading,
    error: api.error,
  };
}

export function usePaymentMutations() {
  const api = useApi();

  const createPayment = async (data: any) => {
    return api.execute(
      fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  };

  const updatePayment = async (id: number, data: any) => {
    return api.execute(
      fetch(`/api/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  };

  const cashPayment = async (id: number, cashingDate: Date) => {
    return api.execute(
      fetch(`/api/payments/${id}/cash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cashingDate }),
      })
    );
  };

  return {
    createPayment,
    updatePayment,
    cashPayment,
    isLoading: api.isLoading,
    error: api.error,
  };
}