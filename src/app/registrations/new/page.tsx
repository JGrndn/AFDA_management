'use client';

import { useRouter } from 'next/navigation';
import { RegistrationForm } from '@/components/regsistrations/RegistrationForm';
import { useRegistrationMutations } from '@/hooks/useMutations';

export default function NewRegistrationPage() {
  const router = useRouter();
  const { createRegistration, isLoading, error } = useRegistrationMutations();

  const handleSubmit = async (data: any) => {
    const result = await createRegistration(data);
    if (result) {
      router.push('/registrations');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <RegistrationForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/registrations')}
        isLoading={isLoading}
      />
    </div>
  );
}