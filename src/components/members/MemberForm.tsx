'use client';

import { useState } from 'react';
import { GenericForm, FormField, Button, Modal } from '@/components/ui';
import { useFamilies } from '@/hooks/useFamilies';

interface MemberFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function MemberForm({ initialData, onSubmit, onCancel, isLoading }: MemberFormProps) {
  const { families, mutate: mutateFamilies } = useFamilies();
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
    ...initialData,
  });

  const [isCreatingFamily, setIsCreatingFamily] = useState(false);
  const [newFamilyData, setNewFamilyData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  const [createFamilyLoading, setCreateFamilyLoading] = useState(false);
  const [createFamilyError, setCreateFamilyError] = useState<string | null>(null);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNewFamilyField = (field: string, value: any) => {
    setNewFamilyData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenCreateFamily = () => {
    // Pré-remplir avec les données du membre
    setNewFamilyData({
      name: `${formData.lastName}`,
      address: '',
      phone: formData.phone || '',
      email: formData.email || '',
    });
    setCreateFamilyError(null);
    setIsCreatingFamily(true);
  };

  const handleCreateFamily = async () => {
    setCreateFamilyLoading(true);
    setCreateFamilyError(null);

    try {
      const response = await fetch('/api/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFamilyData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create family');
      }

      const newFamily = await response.json();
      
      // Rafraîchir la liste des familles
      await mutateFamilies();
      
      // Sélectionner automatiquement la nouvelle famille
      setFormData((prev) => ({ ...prev, familyId: newFamily.id.toString() }));
      
      setIsCreatingFamily(false);
    } catch (err: any) {
      setCreateFamilyError(err.message);
    } finally {
      setCreateFamilyLoading(false);
    }
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
    }

    await onSubmit(data);
  };

  return (
    <>
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family
            </label>
            <div className="flex gap-2">
              <select
                value={formData.familyId}
                onChange={(e) => updateField('familyId', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">No family</option>
                {families.map((f: any) => ({ value: f.id, label: f.name })).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="secondary"
                onClick={handleOpenCreateFamily}
              >
                + New Family
              </Button>
            </div>
          </div>

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

      {/* Modal pour créer une famille */}
      <Modal
        isOpen={isCreatingFamily}
        onClose={() => setIsCreatingFamily(false)}
        title="Create New Family"
        size="md"
      >
        <div className="space-y-4">
          {createFamilyError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
              {createFamilyError}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Create a family to group members together (useful for family discounts and managing multiple members)
            </p>
          </div>

          <FormField
            label="Family Name"
            name="name"
            value={newFamilyData.name}
            onChange={(v) => updateNewFamilyField('name', v)}
            required
          />

          <FormField
            label="Address"
            name="address"
            type="textarea"
            value={newFamilyData.address}
            onChange={(v) => updateNewFamilyField('address', v)}
          />

          <FormField
            label="Phone"
            name="phone"
            value={newFamilyData.phone}
            onChange={(v) => updateNewFamilyField('phone', v)}
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            value={newFamilyData.email}
            onChange={(v) => updateNewFamilyField('email', v)}
          />

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreatingFamily(false)}
              disabled={createFamilyLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateFamily}
              disabled={createFamilyLoading || !newFamilyData.name}
              className="flex-1"
            >
              {createFamilyLoading ? 'Creating...' : 'Create Family'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}