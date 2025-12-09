'use client';

import { useRouter } from 'next/navigation';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { usePaymentMutations } from '@/hooks/useMutations';

export default function NewPaymentPage() {
  const router = useRouter();
  const { createPayment, isLoading, error } = usePaymentMutations();

  const handleSubmit = async (data: any) => {
    const result = await createPayment(data);
    if (result) {
      router.push('/payments');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <PaymentForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/payments')}
        isLoading={isLoading}
      />
    </div>
  );
}