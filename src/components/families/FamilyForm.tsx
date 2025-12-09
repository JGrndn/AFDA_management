'use client';

import { useState } from 'react';
import { GenericForm, FormField } from '@/components/ui';

interface FamilyFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function FamilyForm({ initialData, onSubmit, onCancel, isLoading }: FamilyFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
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
      title={initialData ? 'Edit Family' : 'New Family'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Family Name"
          name="name"
          value={formData.name}
          onChange={(v) => updateField('name', v)}
          required
        />

        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(v) => updateField('email', v)}
        />

        <FormField
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={(v) => updateField('phone', v)}
        />

        <div className="md:col-span-2">
          <FormField
            label="Address"
            name="address"
            type="textarea"
            value={formData.address}
            onChange={(v) => updateField('address', v)}
          />
        </div>
      </div>
    </GenericForm>
  );
}