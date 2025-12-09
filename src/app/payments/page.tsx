'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePayments } from '@/hooks/usePayments';
import { usePaymentMutations } from '@/hooks/useMutations';
import { DataTable, Button, StatusBadge, Card } from '@/components/ui';

export default function PaymentsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'uncashed'>('all');
  const { payments, isLoading, mutate } = usePayments({
    uncashedOnly: filter === 'uncashed',
  });
  const { cashPayment } = usePaymentMutations();

  const handleCashPayment = async (paymentId: number) => {
    if (confirm('Mark this payment as cashed?')) {
      const result = await cashPayment(paymentId, new Date());
      if (result) {
        mutate();
      }
    }
  };

  const columns = [
    {
      key: 'reference',
      label: 'Reference',
      render: (payment: any) => payment.reference || '-',
    },
    {
      key: 'paymentType',
      label: 'Type',
      render: (payment: any) => (
        <span className="capitalize">{payment.paymentType}</span>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (payment: any) => `€${Number(payment.totalAmount).toFixed(2)}`,
    },
    {
      key: 'paymentDate',
      label: 'Payment Date',
      render: (payment: any) => new Date(payment.paymentDate).toLocaleDateString(),
    },
    {
      key: 'cashingDate',
      label: 'Cashed Date',
      render: (payment: any) =>
        payment.cashingDate ? new Date(payment.cashingDate).toLocaleDateString() : '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (payment: any) => <StatusBadge status={payment.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (payment: any) =>
        payment.paymentType === 'check' && !payment.cashingDate ? (
          <Button
            size="sm"
            onClick={(e: Event) => {
              e.stopPropagation();
              handleCashPayment(payment.id);
            }}
          >
            Cash
          </Button>
        ) : null,
    },
  ];

  const uncashedChecks = payments.filter(
    (p: any) => p.paymentType === 'check' && !p.cashingDate
  ).length;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments</h1>
        <Button onClick={() => router.push('/payments/new')}>
          Record Payment
        </Button>
      </div>

      {uncashedChecks > 0 && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-yellow-600 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-900">Uncashed Checks</h3>
              <p className="text-yellow-800">
                You have {uncashedChecks} check{uncashedChecks > 1 ? 's' : ''} waiting to be cashed
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            All Payments
          </Button>
          <Button
            variant={filter === 'uncashed' ? 'primary' : 'secondary'}
            onClick={() => setFilter('uncashed')}
          >
            Uncashed Checks
          </Button>
        </div>
      </Card>

      <DataTable
        data={payments}
        columns={columns}
        onRowClick={(payment: any) => router.push(`/payments/${payment.id}`)}
        isLoading={isLoading}
        emptyMessage="No payments found"
      />
    </div>
  );
}