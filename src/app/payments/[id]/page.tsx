'use client';

import { useRouter } from 'next/navigation';
import { usePayment } from '@/hooks/usePayments';
import { usePaymentMutations } from '@/hooks/useMutations';
import { Card, Button, StatusBadge } from '@/components/ui';

export default function PaymentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const paymentId = parseInt(params.id);
  const { payment, isLoading, mutate } = usePayment(paymentId);
  const { cashPayment } = usePaymentMutations();

  const handleCash = async () => {
    if (confirm('Mark this payment as cashed?')) {
      const result = await cashPayment(paymentId, new Date());
      if (result) {
        mutate();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <p>Payment not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payment Details</h1>
        <div className="flex gap-2">
          {payment.paymentType === 'check' && !payment.cashingDate && (
            <Button onClick={handleCash}>Mark as Cashed</Button>
          )}
          <Button variant="secondary" onClick={() => router.push('/payments')}>
            Back
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card title="Payment Information">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Reference</dt>
              <dd className="mt-1 text-sm text-gray-900">{payment.reference || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{payment.paymentType}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="mt-1 text-sm text-gray-900 font-semibold">
                €{Number(payment.totalAmount).toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <StatusBadge status={payment.status} />
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Payment Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(payment.paymentDate).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Cashing Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {payment.cashingDate
                  ? new Date(payment.cashingDate).toLocaleDateString()
                  : '-'}
              </dd>
            </div>
            {payment.notes && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900">{payment.notes}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card title="Related Registrations">
          {payment.paymentRegistrations && payment.paymentRegistrations.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {payment.paymentRegistrations.map((pr: any) => (
                <li key={pr.id} className="py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {pr.registration.member.firstName} {pr.registration.member.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pr.registration.season.label}
                        {pr.workshopRegistration && ` - ${pr.workshopRegistration.workshop.name}`}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      €{Number(pr.allocatedAmount).toFixed(2)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No registrations linked</p>
          )}
        </Card>
      </div>
    </div>
  );
}