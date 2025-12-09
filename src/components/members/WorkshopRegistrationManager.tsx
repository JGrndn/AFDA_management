'use client';

import { useState } from 'react';
import { Card, Button, Modal, StatusBadge } from '@/components/ui';
import { useActiveSeason } from '@/hooks/useSeasons';
import { useWorkshops } from '@/hooks/useWorkshops';
import { useRegistrationMutations } from '@/hooks/useMutations';

interface WorkshopRegistrationManagerProps {
  member: any;
  onUpdate: () => void;
}

export function WorkshopRegistrationManager({ 
  member, 
  onUpdate 
}: WorkshopRegistrationManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkshops, setSelectedWorkshops] = useState<number[]>([]);
  const [familyOrder, setFamilyOrder] = useState(1);
  
  const { season: activeSeason } = useActiveSeason();
  const { workshops } = useWorkshops({ seasonId: activeSeason?.id });
  const { createRegistration, updateWorkshops, isLoading, error } = useRegistrationMutations();

  // Trouver l'inscription pour la saison active
  const activeRegistration = member.registrations?.find(
    (reg: any) => reg.seasonId === activeSeason?.id
  );

  // Ateliers déjà inscrits
  const enrolledWorkshopIds = activeRegistration?.workshopRegistrations.map(
    (wr: any) => wr.workshopId
  ) || [];

  const handleOpenModal = () => {
    setSelectedWorkshops(enrolledWorkshopIds);
    setFamilyOrder(activeRegistration?.familyOrder || 1);
    setIsModalOpen(true);
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

  const handleSubmit = async () => {
    if (!activeSeason) return;
    let result;

// Si une inscription existe déjà, mettre à jour les ateliers
    if (activeRegistration) {
      result = await updateWorkshops(
        activeRegistration.id,
        selectedWorkshops,
        familyOrder
      );
    } else {
      // Sinon, créer une nouvelle inscription
      result = await createRegistration({
        memberId: member.id,
        seasonId: activeSeason.id,
        workshopIds: selectedWorkshops,
        familyOrder,
      });
    }

    if (result) {
      setIsModalOpen(false);
      onUpdate();
    }
  };

  if (!activeSeason) {
    return (
      <Card title="Workshop Registrations">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          No active season found. Please create and activate a season first.
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card 
        title="Workshop Registrations"
        actions={
          <Button size="sm" onClick={handleOpenModal}>
            {activeRegistration ? 'Manage Workshops' : 'Add Workshops'}
          </Button>
        }
      >
        <div className="space-y-4">
          {/* Inscriptions par saison triées */}
          {member.registrations && member.registrations.length > 0 ? (
            member.registrations
              .sort((a: any, b: any) => b.season.startYear - a.season.startYear)
              .map((reg: any) => (
                <div key={reg.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{reg.season.label}</h4>
                      <div className="text-sm text-gray-500 mt-1">
                        Family Order: {reg.familyOrder}
                        {reg.familyOrder > 1 && (
                          <span className="ml-2 text-green-600">(10% discount)</span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={reg.status} />
                  </div>
                  
                  {reg.workshopRegistrations.length > 0 ? (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Workshops:</h5>
                      <ul className="space-y-2">
                        {reg.workshopRegistrations.map((wr: any) => (
                          <li key={wr.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span className="text-sm">{wr.workshop.name}</span>
                            <div className="text-sm text-right">
                              <span className="font-semibold">€{Number(wr.appliedPrice).toFixed(2)}</span>
                              {wr.discountPercent > 0 && (
                                <span className="ml-2 text-xs text-green-600">
                                  (-{wr.discountPercent}%)
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No workshops selected</p>
                  )}
                </div>
              ))
          ) : (
            <p className="text-gray-500">No registrations yet</p>
          )}
        </div>
      </Card>

      {/* Modal pour gérer les ateliers */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Manage Workshops - ${activeSeason.label}`}
        size="lg"
      >
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              {member.firstName} {member.lastName}
            </h3>
            <p className="text-sm text-blue-800">
              Season: {activeSeason.label} | Membership: €{activeSeason.membershipAmount}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family Order
            </label>
            <input
              type="number"
              min="1"
              value={familyOrder}
              onChange={(e) => setFamilyOrder(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Set to 1 for first family member, 2+ for siblings (10% workshop discount)
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Select Workshops</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
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
                    <div className="flex items-center flex-1">
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
                    <div className="text-right ml-4">
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

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || selectedWorkshops.length === 0}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : activeRegistration ? 'Update Registration' : 'Create Registration'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}