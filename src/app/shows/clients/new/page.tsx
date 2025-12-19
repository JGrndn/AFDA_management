'use client';

import { useRouter } from 'next/navigation';
import { ShowClientForm } from '@/components/shows/ShowClientForm';
import { useShowClientMutations } from '@/hooks/useMutations';

export default function NewShowClientPage() {
  const router = useRouter();
  const { createShowClient, isLoading, error } = useShowClientMutations();

  const handleSubmit = async (data: any) => {
    const result = await createShowClient(data);
    if (result) {
      router.push('/shows/clients');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <ShowClientForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/shows/clients')}
        isLoading={isLoading}
      />
    </div>
  );
}