'use client';

import { useRouter } from 'next/navigation';
import { WorkshopForm } from '@/components/workshops/WorkshopForm';
import { useWorkshopMutations } from '@/hooks/useMutations';

export default function NewWorkshopPage() {
  const router = useRouter();
  const { createWorkshop, isLoading, error } = useWorkshopMutations();

  const handleSubmit = async (data: any) => {
    const result = await createWorkshop(data);
    if (result) {
      router.push('/workshops');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <WorkshopForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/workshops')}
        isLoading={isLoading}
      />
    </div>
  );
}