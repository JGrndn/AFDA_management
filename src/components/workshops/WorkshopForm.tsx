'use client';

import { useState } from 'react';
import { GenericForm, FormField } from '@/components/ui';

interface WorkshopFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function WorkshopForm({ initialData, onSubmit, onCancel, isLoading }: WorkshopFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
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
      title={initialData ? 'Edit Workshop' : 'New Workshop'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      <FormField
        label="Workshop Name"
        name="name"
        value={formData.name}
        onChange={(v) => updateField('name', v)}
        required
      />

      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={formData.description}
        onChange={(v) => updateField('description', v)}
      />

      <FormField
        label="Active"
        name="isActive"
        type="checkbox"
        value={formData.isActive}
        onChange={(v) => updateField('isActive', v)}
        helpText="Inactive workshops won't appear in registration forms"
      />
    </GenericForm>
  );
}