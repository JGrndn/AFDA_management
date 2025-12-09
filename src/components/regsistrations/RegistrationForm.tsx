'use client';

import { useState, useEffect } from 'react';
import { GenericForm, FormField } from '@/components/ui';
import { useMembers } from '@/hooks/useMembers';
import { useActiveSeason } from '@/hooks/useSeasons';
import { useWorkshops } from '@/hooks/useWorkshops';

interface RegistrationFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function RegistrationForm({ onSubmit, onCancel, isLoading }: RegistrationFormProps) {
  const { members } = useMembers();
  const { season: activeSeason } = useActiveSeason();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [familyOrder, setFamilyOrder] = useState(1);
  const [selectedWorkshops, setSelectedWorkshops] = useState<number[]>([]);
  
  const { workshops } = useWorkshops({
    seasonId: activeSeason?.id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMember || !activeSeason) return;

    await onSubmit({
      memberId: selectedMember.id,
      seasonId: activeSeason.id,
      workshopIds: selectedWorkshops,
      familyOrder,
    });
  };

  const toggleWorkshop = (workshopId: number) => {
    setSelectedWorkshops((prev) =>
      prev.includes(workshopId)
        ? prev.filter((id) => id !== workshopId)
        : [...prev, workshopId]
    );
  };

  const calculateTotal = () => {
    if (!activeSeason || !workshops) return 0;

    const membershipAmount = Number(activeSeason.membershipAmount);
    const workshopTotal = workshops
      .filter((w: any) => selectedWorkshops.includes(w.id))
      .reduce((sum: number, w: any) => {
        const price = w.workshopPrices?.[0]?.amount || 0;
        const discount = familyOrder > 1 ? 0.9 : 1;
        return sum + Number(price) * discount;
      }, 0);

    return membershipAmount + workshopTotal;
  };

  if (!activeSeason) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        No active season found. Please create and activate a season first.
      </div>
    );
  }

  return (
    <GenericForm
      title="New Registration"
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      submitLabel="Register"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900">Active Season</h3>
          <p className="text-blue-800">{activeSeason.label}</p>
          <p className="text-sm text-blue-600">
            Membership: €{activeSeason.membershipAmount}
          </p>
        </div>

        <FormField
          label="Member"
          name="memberId"
          type="select"
          value={selectedMember?.id || ''}
          onChange={(v) => {
            const member = members.find((m: any) => m.id === parseInt(v));
            setSelectedMember(member);
          }}
          options={members.map((m: any) => ({
            value: m.id,
            label: `${m.firstName} ${m.lastName}${m.family ? ` (${m.family.name})` : ''}`,
          }))}
          required
        />

        <FormField
          label="Family Order"
          name="familyOrder"
          type="number"
          value={familyOrder}
          onChange={setFamilyOrder}
          helpText="Set to 1 for first family member, 2+ for siblings (10% workshop discount)"
          required
        />

        <div>
          <h3 className="text-lg font-semibold mb-3">Select Workshops</h3>
          <div className="space-y-2">
            {workshops.map((workshop: any) => {
              const price = workshop.workshopPrices?.[0]?.amount || 0;
              const discountedPrice = familyOrder > 1 ? price * 0.9 : price;
              const isSelected = selectedWorkshops.includes(workshop.id);

              return (
                <label
                  key={workshop.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition ${
                    isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleWorkshop(workshop.id)}
                      className="h-4 w-4 text-blue-600 mr-3"
                    />
                    <div>
                      <div className="font-medium">{workshop.name}</div>
                      {workshop.description && (
                        <div className="text-sm text-gray-500">{workshop.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">€{discountedPrice}</div>
                    {familyOrder > 1 && (
                      <div className="text-xs text-green-600">
                        (10% discount)
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-blue-600">
              €{calculateTotal().toFixed(2)}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <div>Membership: €{activeSeason.membershipAmount}</div>
            <div>
              Workshops: €
              {(calculateTotal() - Number(activeSeason.membershipAmount)).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </GenericForm>
  );
}