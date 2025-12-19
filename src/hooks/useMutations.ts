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

interface WorkshopQuantity {
  workshopId: number;
  quantity: number;
}

export function useRegistrationMutations() {
  const api = useApi();

  const createRegistration = async (data: {
    memberId: number;
    seasonId: number;
    workshopQuantities: WorkshopQuantity[];
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
    workshopQuantities: WorkshopQuantity[],
    familyOrder: number
  ) => {
    return api.execute(
      fetch(`/api/registrations/${registrationId}/workshops`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workshopQuantities, familyOrder }),
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

  const deletePayment = async (id: number) => {
    return api.execute(
      fetch(`/api/payments/${id}`, { method: 'DELETE' })
    );
  };

  return {
    createPayment,
    updatePayment,
    cashPayment,
    deletePayment,
    isLoading: api.isLoading,
    error: api.error,
  };
}

export function useFamilyMutations() {
  const api = useApi();

  const createFamily = async (data: any) => {
    return api.execute(
      fetch('/api/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  };

  const updateFamily = async (id: number, data: any) => {
    return api.execute(
      fetch(`/api/families/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  };

  const deleteFamily = async (id: number) => {
    return api.execute(
      fetch(`/api/families/${id}`, { method: 'DELETE' })
    );
  };

  return {
    createFamily,
    updateFamily,
    deleteFamily,
    isLoading: api.isLoading,
    error: api.error,
  };
}

export function useWorkshopMutations() {
  const api = useApi();

  const createWorkshop = async (data: any) => {
    return api.execute(
      fetch('/api/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  };

  const updateWorkshop = async (id: number, data: any) => {
    return api.execute(
      fetch(`/api/workshops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  };

  const deleteWorkshop = async (id: number) => {
    return api.execute(
      fetch(`/api/workshops/${id}`, { method: 'DELETE' })
    );
  };

  return {
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
    isLoading: api.isLoading,
    error: api.error,
  };
}

export function useShowMutations() {
  const api = useApi();

  const createShow = async (data: any) => {
    return api.execute(
      fetch('/api/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  };

  const updateShow = async (id: number, data: any) => {
    return api.execute(
      fetch(`/api/shows/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  };

  const deleteShow = async (id: number) => {
    return api.execute(
      fetch(`/api/shows/${id}`, { method: 'DELETE' })
    );
  };

  return {
    createShow,
    updateShow,
    deleteShow,
    isLoading: api.isLoading,
    error: api.error,
  };
}

export function useShowClientMutations() {
  const api = useApi();

  const createShowClient = async (data: any) => {
    return api.execute(
      fetch('/api/shows/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  };

  const updateShowClient = async (id: number, data: any) => {
    return api.execute(
      fetch(`/api/shows/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );
  };

  const deleteShowClient = async (id: number) => {
    return api.execute(
      fetch(`/api/shows/clients/${id}`, { method: 'DELETE' })
    );
  };

  return {
    createShowClient,
    updateShowClient,
    deleteShowClient,
    isLoading: api.isLoading,
    error: api.error,
  };
}