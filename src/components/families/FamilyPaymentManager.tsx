// components/families/FamilyPaymentManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Modal, StatusBadge } from '@/components/ui';

const PAYMENT_TYPES = ['cash', 'check', 'transfer', 'card'] as const;

interface PaymentStatusType {
  totalDue: number;
  totalPaid: number;
  balance: number;
  donation: number;
  isFullyPaid: boolean;
  status: 'validated' | 'partial' | 'unpaid';
}

interface FormDataType {
  amount: string;
  paymentType: string;
  paymentDate: string;
  reference: string;
  notes: string;
}

interface FamilyPaymentManagerProps {
  family: any;
  season: any;
  onUpdate: () => void;
}

export function FamilyPaymentManager({ family, season, onUpdate }: FamilyPaymentManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cashingId, setCashingId] = useState<number | null>(null);
  const [validatingId, setValidatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormDataType>({
    amount: '',
    paymentType: 'check',
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
  });

  useEffect(() => {
    if (family?.id && season?.id) {
      fetchPaymentData();
    }
  }, [family?.id, season?.id]);

  const fetchPaymentData = async () => {
    if (!family?.id || !season?.id) return;
    
    try {
      setError(null);
      
      const paymentsRes = await fetch(`/api/payments?familyId=${family.id}&seasonId=${season.id}`);
      if (!paymentsRes.ok) throw new Error('Failed to fetch payments');
      const paymentsData = await paymentsRes.json();
      setPayments(paymentsData);

      const statusRes = await fetch(`/api/payments/status?familyId=${family.id}&seasonId=${season.id}`);
      if (!statusRes.ok) throw new Error('Failed to fetch payment status');
      const statusData = await statusRes.json();
      setPaymentStatus(statusData);
    } catch (error: any) {
      console.error('Error fetching payment data:', error);
      setError(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId: family.id,
          seasonId: season.id,
          amount: parseFloat(formData.amount),
          paymentType: formData.paymentType,
          paymentDate: new Date(formData.paymentDate),
          reference: formData.reference || undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }

      setIsModalOpen(false);
      setFormData({
        amount: '',
        paymentType: 'check',
        paymentDate: new Date().toISOString().split('T')[0],
        reference: '',
        notes: '',
      });
      await fetchPaymentData();
      onUpdate();
    } catch (error: any) {
      console.error('Error creating payment:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidatePayment = async (paymentId: number) => {
    //if (!confirm('Validate this payment? This will mark it as cashed immediately.')) return;
    
    setValidatingId(paymentId);
    setError(null);
    
    try {
      const response = await fetch(`/api/payments/${paymentId}/cash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cashingDate: new Date() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to validate payment');
      }

      await fetchPaymentData();
      onUpdate();
    } catch (error: any) {
      console.error('Error validating payment:', error);
      setError(error.message);
    } finally {
      setValidatingId(null);
    }
  };

  if (!paymentStatus) {
    return (
      <Card title={`Payment Status - ${season?.label || ''}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading payment data...</p>
        </div>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (paymentStatus.isFullyPaid) return 'bg-green-50 border-green-200';
    if (paymentStatus.status === 'partial') return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusText = () => {
    if (paymentStatus.isFullyPaid) return '✅ Fully Paid';
    if (paymentStatus.status === 'partial') return '⏳ Partially Paid';
    return '❌ Unpaid';
  };

  return (
    <>
      <Card
        title={`Payment Status - ${season.label}`}
        actions={
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            Add Payment
          </Button>
        }
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Family Members ({family.members?.length || 0})</h4>
            <ul className="space-y-2 text-sm">
              {family.members?.map((member: any) => {
                const membership = member.memberships?.find((m: any) => m.seasonId === season.id);
                const registration = member.registrations?.find((r: any) => r.seasonId === season.id);
                
                const memberTotal = 
                  (membership ? Number(membership.amount) : 0) +
                  (registration?.workshopRegistrations?.reduce(
                    (sum: number, wr: any) => sum + Number(wr.appliedPrice),
                    0
                  ) || 0);

                return (
                  <li key={member.id} className="flex justify-between">
                    <span>{member.firstName} {member.lastName}</span>
                    <span className="font-semibold">€{memberTotal.toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div>
                <div className="text-sm text-gray-600">Total Due</div>
                <div className="text-lg font-bold">€{paymentStatus.totalDue.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Paid</div>
                <div className="text-lg font-bold">€{paymentStatus.totalPaid.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Balance</div>
                <div className="text-lg font-bold">€{paymentStatus.balance.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className="text-sm font-semibold">{getStatusText()}</div>
              </div>
            </div>
            
            {paymentStatus.donation > 0 && (
              <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded text-sm text-blue-800">
                💝 Donation: €{paymentStatus.donation.toFixed(2)} - Thank you!
              </div>
            )}
          </div>

          {payments.length > 0 ? (
            <div>
              <h4 className="font-semibold mb-3">Payments</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Reference</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cashed</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{payment.reference || '-'}</td>
                        <td className="px-4 py-2 text-sm capitalize">{payment.paymentType}</td>
                        <td className="px-4 py-2 text-sm font-semibold">€{Number(payment.amount).toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-sm">
                          {payment.cashingDate ? new Date(payment.cashingDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-2">
                          <StatusBadge status={payment.status} />
                        </td>
                        <td className="px-4 py-2 text-right">
                          {payment.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleValidatePayment(payment.id)}
                              disabled={validatingId === payment.id}
                            >
                              {validatingId === payment.id ? 'Validating...' : 'Validate'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No payments recorded yet
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Payment"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              {error}
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">{family.name}</h4>
            <div className="text-sm text-blue-800">
              <div>Total due: €{paymentStatus.totalDue.toFixed(2)}</div>
              <div>Already paid: €{paymentStatus.totalPaid.toFixed(2)}</div>
              <div className="font-semibold mt-1">
                Balance: €{paymentStatus.balance.toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (€) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type *
            </label>
            <select
              value={formData.paymentType}
              onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {PAYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference (Check #, Transaction ID, etc.)
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="CHQ-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Payment'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}