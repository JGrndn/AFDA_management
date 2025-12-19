'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePayments } from '@/hooks/usePayments';
import { DataTable, Button, StatusBadge, Card, Modal, Tooltip } from '@/components/ui';
import { translatePaymentType } from '@/lib/i18n/translations';

export default function PaymentsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'uncashed'>('all');
  const { payments, isLoading, mutate } = usePayments({
    uncashedOnly: filter === 'uncashed',
  });
  
  const [isCashingModalOpen, setIsCashingModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [cashingDate, setCashingDate] = useState(new Date().toISOString().split('T')[0]);
  const [cashingLoading, setCashingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenCashingModal = (paymentId: number) => {
    setSelectedPaymentId(paymentId);
    setCashingDate(new Date().toISOString().split('T')[0]);
    setError(null);
    setIsCashingModalOpen(true);
  };

  const handleConfirmCashing = async () => {
    if (!selectedPaymentId) return;

    setCashingLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/${selectedPaymentId}/cash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cashingDate: new Date(cashingDate) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cash payment');
      }

      setIsCashingModalOpen(false);
      setSelectedPaymentId(null);
      await mutate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCashingLoading(false);
    }
  };

  const columns = [
    {
      key: 'reference',
      label: 'Reference',
      render: (payment: any) => payment.reference || '-',
    },
    {
      key: 'family',
      label: 'Family/Member',
      render: (payment: any) => {
        if (payment.family) {
          return payment.family.name;
        } else if (payment.member) {
          return `${payment.member.firstName} ${payment.member.lastName}`;
        }
        return '-';
      },
    },
    {
      key: 'paymentType',
      label: 'Type',
      render: (payment: any) => (
        <span className="capitalize">{translatePaymentType(payment.paymentType)}</span>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (payment: any) => `${Number(payment.totalAmount || payment.amount).toFixed(2)} €`,
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
      render: (payment: any) => <StatusBadge status={payment.status} type ="payment" />,
    },
    {
      key:'notes',
      label:'Notes',
      render: (payment: any) => payment.notes ? <Tooltip content={payment.notes}/> : '',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (payment: any) =>
        payment.status === 'pending' ? (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenCashingModal(payment.id);
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
        onRowClick={(payment) => router.push(`/payments/${payment.id}`)}
        isLoading={isLoading}
        emptyMessage="No payments found"
      />

      {/* Modal d'encaissement */}
      <Modal
        isOpen={isCashingModalOpen}
        onClose={() => {
          setIsCashingModalOpen(false);
          setSelectedPaymentId(null);
          setError(null);
        }}
        title="Cash Payment"
        size="md"
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Please confirm the cashing date for this payment.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cashing Date *
            </label>
            <input
              type="date"
              value={cashingDate}
              onChange={(e) => setCashingDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Default is today's date, but you can adjust it if needed
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCashingModalOpen(false);
                setSelectedPaymentId(null);
                setError(null);
              }}
              disabled={cashingLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmCashing}
              disabled={cashingLoading}
              className="flex-1"
            >
              {cashingLoading ? 'Cashing...' : 'Cash Payment'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}