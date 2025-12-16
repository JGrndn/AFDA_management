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
    allowMultiple: false,
    maxPerMember: null,
    ...initialData,
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      maxPerMember: formData.maxPerMember || null,
    });
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

      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-4">Multiple Registrations</h3>
        
        <FormField
          label="Allow Multiple Registrations"
          name="allowMultiple"
          type="checkbox"
          value={formData.allowMultiple}
          onChange={(v) => updateField('allowMultiple', v)}
          helpText="Allow members to register multiple times for this workshop (e.g., language courses, sessions)"
        />

        {formData.allowMultiple && (
          <FormField
            label="Maximum per Member"
            name="maxPerMember"
            type="number"
            value={formData.maxPerMember || ''}
            onChange={(v) => updateField('maxPerMember', v ? parseInt(v) : null)}
            helpText="Optional: Set a maximum number of times a member can register (leave empty for unlimited)"
          />
        )}
      </div>
    </GenericForm>
  );
}