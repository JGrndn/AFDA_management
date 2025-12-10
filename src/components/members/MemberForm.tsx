'use client';

import { useState, useEffect } from 'react';
import { GenericForm, FormField } from '@/components/ui';
import { useFamilies } from '@/hooks/useFamilies';

interface MemberFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function MemberForm({ initialData, onSubmit, onCancel, isLoading }: MemberFormProps) {
  const { families } = useFamilies();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isMinor: false,
    familyId: '',
    guardianFirstName: '',
    guardianLastName: '',
    guardianEmail: '',
    guardianPhone: '',
    guardianRelation: '',
    ...initialData,
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      familyId: formData.familyId ? parseInt(formData.familyId) : null,
    };

    // Remove guardian fields if not minor
    if (!formData.isMinor) {
      delete data.guardianFirstName;
      delete data.guardianLastName;
      delete data.guardianEmail;
      delete data.guardianPhone;
      delete data.guardianRelation;
    }

    await onSubmit(data);
  };

  return (
    <GenericForm
      title={initialData ? 'Edit Member' : 'New Member'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={(v) => updateField('firstName', v)}
          required
        />

        <FormField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={(v) => updateField('lastName', v)}
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

        <FormField
          label="Family"
          name="familyId"
          type="select"
          value={formData.familyId}
          onChange={(v) => updateField('familyId', v)}
          options={families.map((f: any) => ({ value: f.id, label: f.name }))}
        />

        <FormField
          label="Is Minor"
          name="isMinor"
          type="checkbox"
          value={formData.isMinor}
          onChange={(v) => updateField('isMinor', v)}
        />
      </div>

      {formData.isMinor && (
        <>
          <h3 className="text-lg font-semibold mt-6 mb-4">Legal Guardian Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Guardian First Name"
              name="guardianFirstName"
              value={formData.guardianFirstName}
              onChange={(v) => updateField('guardianFirstName', v)}
              required
            />

            <FormField
              label="Guardian Last Name"
              name="guardianLastName"
              value={formData.guardianLastName}
              onChange={(v) => updateField('guardianLastName', v)}
              required
            />

            <FormField
              label="Guardian Email"
              name="guardianEmail"
              type="email"
              value={formData.guardianEmail}
              onChange={(v) => updateField('guardianEmail', v)}
            />

            <FormField
              label="Guardian Phone"
              name="guardianPhone"
              value={formData.guardianPhone}
              onChange={(v) => updateField('guardianPhone', v)}
              required
            />

          </div>
        </>
      )}
    </GenericForm>
  );
}