'use client';

import { useState } from 'react';
import { GenericForm, FormField } from '@/components/ui';

interface ShowClientFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ShowClientForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading 
}: ShowClientFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
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
      title={initialData ? 'Edit Client' : 'New Client'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Client Name"
          name="name"
          value={formData.name}
          onChange={(v) => updateField('name', v)}
          required
        />

        <FormField
          label="Contact Person"
          name="contactName"
          value={formData.contactName}
          onChange={(v) => updateField('contactName', v)}
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