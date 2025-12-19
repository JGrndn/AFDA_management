'use client';

import { useRouter } from 'next/navigation';
import { ShowForm } from '@/components/shows/ShowForm';
import { useShowMutations } from '@/hooks/useMutations';

export default function NewShowPage() {
  const router = useRouter();
  const { createShow, isLoading, error } = useShowMutations();

  const handleSubmit = async (data: any) => {
    const result = await createShow(data);
    if (result) {
      router.push('/shows');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <ShowForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/shows')}
        isLoading={isLoading}
      />
    </div>
  );
}