'use client';

import { useRouter } from 'next/navigation';
import { FamilyForm } from '@/components/families/FamilyForm';
import { useFamilyMutations } from '@/hooks/useMutations';

export default function NewFamilyPage() {
  const router = useRouter();
  const { createFamily, isLoading, error } = useFamilyMutations();

  const handleSubmit = async (data: any) => {
    const result = await createFamily(data);
    if (result) {
      router.push('/families');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <FamilyForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/families')}
        isLoading={isLoading}
      />
    </div>
  );
}