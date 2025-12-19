'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePayment } from '@/hooks/usePayments';
import { usePaymentMutations } from '@/hooks/useMutations';
import { Button, Card, StatusBadge, Modal, FormField } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getPaymentTypeOptions } from '@/lib/helpers/select-options';
import { translatePaymentType } from '@/lib/i18n/translations';

export default function PaymentDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const paymentId = parseInt(resolvedParams.id);
  
  const { payment, isLoading: paymentLoading, mutate } = usePayment(paymentId);
  const { updatePayment, cashPayment, deletePayment, isLoading: mutationLoading, error } = usePaymentMutations();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isCashingModalOpen, setIsCashingModalOpen] = useState(false);
  const [cashingDate, setCashingDate] = useState(new Date().toISOString().split('T')[0]);
  const [validatingId, setValidatingId] = useState<number | null>(null);
  
  const typeOptions = getPaymentTypeOptions();

  const [formData, setFormData] = useState({
    amount: '',
    paymentType: 'check',
    paymentDate: '',
    reference: '',
    notes: '',
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    setFormData({
      amount: payment.amount.toString(),
      paymentType: payment.paymentType,
      paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
      reference: payment.reference || '',
      notes: payment.notes || '',
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await updatePayment(paymentId, {
      amount: parseFloat(formData.amount),
      paymentType: formData.paymentType,
      paymentDate: new Date(formData.paymentDate),
      reference: formData.reference || undefined,
      notes: formData.notes || undefined,
    });

    if (result) {
      setIsEditing(false);
      mutate();
    }
  };

  const handleOpenCashingModal = () => {
    setCashingDate(new Date().toISOString().split('T')[0]);
    setIsCashingModalOpen(true);
  };

  const handleConfirmCashing = async () => {
    setValidatingId(paymentId);
    
    try {
      const result = await cashPayment(paymentId, new Date(cashingDate));
      
      if (result) {
        setIsCashingModalOpen(false);
        mutate();
      }
    } finally {
      setValidatingId(null);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this payment?')) {
      const result = await deletePayment(paymentId);
      if (result) {
        router.push('/payments');
      }
    }
  };

  if (paymentLoading) {
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
      <Link
        href="/payments"
        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Payments
      </Link>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Payment #{payment.id}
            <StatusBadge status={payment.status} type="payment" />
          </h1>
          {payment.reference && (
            <p className="text-gray-600 mt-1">Reference: {payment.reference}</p>
          )}
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              {payment.status === 'pending' && (
                <Button onClick={handleOpenCashingModal}>
                  Mark as Cashed
                </Button>
              )}
              <Button onClick={handleEdit}>Edit</Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {isEditing ? (
        <Card>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Amount (€)"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={(v) => updateField('amount', v)}
                required
              />

              <FormField
                label="Payment Type"
                name="paymentType"
                type="select"
                value={formData.paymentType}
                onChange={(v) => updateField('paymentType', v)}
                options={typeOptions}
                required
              />

              <FormField
                label="Payment Date"
                name="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(v) => updateField('paymentDate', v)}
                required
              />

              <FormField
                label="Reference"
                name="reference"
                value={formData.reference}
                onChange={(v) => updateField('reference', v)}
                placeholder="Check #, Transaction ID, etc."
              />
            </div>

            <FormField
              label="Notes"
              name="notes"
              type="textarea"
              value={formData.notes}
              onChange={(v) => updateField('notes', v)}
            />

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(false)}
                disabled={mutationLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutationLoading}>
                {mutationLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card title="Payment Information">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">
                  €{Number(payment.amount).toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Payment Type</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{translatePaymentType(payment.paymentType)}
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
              <div>
                <dt className="text-sm font-medium text-gray-500">Reference</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {payment.reference || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={payment.status} type="payment" />
                </dd>
              </div>
              {payment.notes && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {payment.notes}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card title="Related Information">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Season</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {payment.season?.label}
                </dd>
              </div>
              {payment.family && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Family</dt>
                  <dd className="mt-1">
                    <button
                      onClick={() => router.push(`/families/${payment.family.id}`)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {payment.family.name}
                    </button>
                  </dd>
                </div>
              )}
              {payment.member && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Member</dt>
                  <dd className="mt-1">
                    <button
                      onClick={() => router.push(`/members/${payment.member.id}`)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {payment.member.firstName} {payment.member.lastName}
                    </button>
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card title="Metadata">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(payment.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(payment.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      )}

      {/* Modal de validation avec date d'encaissement */}
      <Modal
        isOpen={isCashingModalOpen}
        onClose={() => {
          setIsCashingModalOpen(false);
        }}
        title="Mark Payment as Cashed"
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
              Please confirm the cashing date for this payment. This will mark it as cashed 
              and update membership statuses.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Payment Amount</span>
              <span className="text-lg font-bold">€{Number(payment.amount).toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600">
              Type: <span className="capitalize">{payment.paymentType}</span>
              {payment.reference && ` • Reference: ${payment.reference}`}
            </div>
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
              onClick={() => setIsCashingModalOpen(false)}
              disabled={validatingId !== null}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmCashing}
              disabled={validatingId !== null}
              className="flex-1"
            >
              {validatingId !== null ? 'Processing...' : 'Confirm Cashing'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}