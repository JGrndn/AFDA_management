'use client';

import { useState } from 'react';
import { GenericForm, FormField } from '@/components/ui';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useActiveSeason } from '@/hooks/useSeasons';
import type { PaymentType } from '@/lib/schemas/enums';
import { getPaymentTypeOptions } from '@/lib/helpers/select-options';

interface PaymentFormProps {
  initialData:any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function PaymentForm({ onSubmit, onCancel, isLoading }: PaymentFormProps) {
  const { season: activeSeason } = useActiveSeason();
  const { registrations } = useRegistrations(activeSeason?.id);

  const [paymentType, setPaymentType] = useState<PaymentType>('check');
  const typeOptions = getPaymentTypeOptions();
  
  const [formData, setFormData] = useState({
    paymentType: paymentType,
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
    selectedRegistrations: [] as number[],
  });

  const [registrationAmounts, setRegistrationAmounts] = useState<Record<number, number>>({});

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleRegistration = (regId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedRegistrations: prev.selectedRegistrations.includes(regId)
        ? prev.selectedRegistrations.filter((id) => id !== regId)
        : [...prev.selectedRegistrations, regId],
    }));
  };

  const updateAmount = (regId: number, amount: number) => {
    setRegistrationAmounts((prev) => ({
      ...prev,
      [regId]: amount,
    }));
  };

  const calculateTotal = () => {
    return formData.selectedRegistrations.reduce((sum, regId) => {
      return sum + (registrationAmounts[regId] || 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const paymentData = {
      paymentType: formData.paymentType,
      paymentDate: new Date(formData.paymentDate),
      totalAmount: calculateTotal(),
      reference: formData.reference || undefined,
      notes: formData.notes || undefined,
      registrations: formData.selectedRegistrations.map((regId) => ({
        registrationId: regId,
        allocatedAmount: registrationAmounts[regId] || 0,
        amountType: 'workshop', // You can make this more dynamic
      })),
    };

    await onSubmit(paymentData);
  };

  const getRegistrationTotal = (registration: any) => {
    const membershipAmount = Number(registration.season.membershipAmount);
    const workshopTotal = registration.workshopRegistrations.reduce(
      (sum: number, wr: any) => sum + Number(wr.appliedPrice),
      0
    );
    return membershipAmount + workshopTotal;
  };

  return (
    <GenericForm
      title="Record Payment"
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormField
          label="Payment Type"
          name="paymentType"
          type="select"
          value={formData.paymentType}
          onChange={(e) => setPaymentType(e.target.value as PaymentType)}
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
          placeholder="Check number, transaction ID, etc."
        />

        <FormField
          label="Notes"
          name="notes"
          type="textarea"
          value={formData.notes}
          onChange={(v) => updateField('notes', v)}
        />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select Registrations to Pay</h3>
        <div className="space-y-3">
          {registrations.map((registration: any) => {
            const total = getRegistrationTotal(registration);
            const isSelected = formData.selectedRegistrations.includes(registration.id);

            return (
              <div
                key={registration.id}
                className={`border rounded-lg p-4 ${
                  isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                }`}
              >
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleRegistration(registration.id)}
                    className="h-4 w-4 text-blue-600 mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {registration.member.firstName} {registration.member.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {registration.workshopRegistrations.length} workshops • Total: €{total.toFixed(2)}
                    </div>
                    {isSelected && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount to pay
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={registrationAmounts[registration.id] || ''}
                          onChange={(e) =>
                            updateAmount(registration.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder={`Max: €${total.toFixed(2)}`}
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total Payment Amount</span>
          <span className="text-2xl font-bold text-blue-600">
            €{calculateTotal().toFixed(2)}
          </span>
        </div>
      </div>
    </GenericForm>
  );
}