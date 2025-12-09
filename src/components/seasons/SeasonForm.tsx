'use client';

import { useState } from 'react';
import { GenericForm, FormField } from '@/components/ui';

interface SeasonFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function SeasonForm({ initialData, onSubmit, onCancel, isLoading }: SeasonFormProps) {
  const [formData, setFormData] = useState({
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 1,
    label: '',
    membershipAmount: 0,
    isActive: false,
    ...initialData,
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <GenericForm
      title={initialData ? 'Edit Season' : 'New Season'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Start Year"
          name="startYear"
          type="number"
          value={formData.startYear}
          onChange={(v) => updateField('startYear', v)}
          required
        />

        <FormField
          label="End Year"
          name="endYear"
          type="number"
          value={formData.endYear}
          onChange={(v) => updateField('endYear', v)}
          required
        />

        <FormField
          label="Label"
          name="label"
          value={formData.label}
          onChange={(v) => updateField('label', v)}
          placeholder="e.g., 2024-2025"
          required
        />

        <FormField
          label="Membership Amount (€)"
          name="membershipAmount"
          type="number"
          value={formData.membershipAmount}
          onChange={(v) => updateField('membershipAmount', v)}
          required
        />

        <FormField
          label="Active Season"
          name="isActive"
          type="checkbox"
          value={formData.isActive}
          onChange={(v) => updateField('isActive', v)}
          helpText="Only one season can be active at a time"
        />
      </div>
    </GenericForm>
  );
}