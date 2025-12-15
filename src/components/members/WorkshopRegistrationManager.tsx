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
    const workshopTotal = workshops
      .filter((w: any) => selectedWorkshops.includes(w.id))
      .reduce((sum: number, w: any) => {
        const price = w.workshopPrices?.[0]?.amount || 0;
        const discount = familyOrder > 1 ? (1 - activeSeason.discountPercent / 100) : 1;
        return sum + Number(price) * discount;
      }, 0);

    return workshopTotal;
  };

  const handleSubmit = async () => {
    if (!activeSeason) return;
    let result;
    if (activeRegistration){
      result = await updateWorkshops(
        activeRegistration.id,
        selectedWorkshops,
        familyOrder
      );
    }
    else {
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
          activeSeason && (
            <Button size="sm" onClick={handleOpenModal}>
              {activeRegistration ? `Manage ${activeSeason.label}` : `Register for ${activeSeason.label}`}
            </Button>
          )
        }
      >
        {activeSeason ? (
          <div>
            {/* Info : on ne peut gérer que la saison active */}
            {!activeRegistration ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-900">No registration for {activeSeason.label}</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Click the button above to register this member for the current season.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-400">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-lg">{activeRegistration.season.label}</h4>
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Family Order: {activeRegistration.familyOrder}
                      {activeRegistration.familyOrder > 1 && (
                        <span className="ml-2 text-green-600">({activeSeason.discountPercent}% discount)</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {activeRegistration.workshopRegistrations.length > 0 ? (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Workshops:</h5>
                    <ul className="space-y-2">
                      {activeRegistration.workshopRegistrations.map((wr: any) => (
                        <li key={wr.id} className="flex justify-between items-center bg-white p-2 rounded">
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
                  <p className="text-sm text-gray-500 italic mt-3">No workshops selected</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No active season available
          </div>
        )}
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
              Set to 1 for first family member, 2+ for siblings ({activeSeason.discountPercent}% workshop discount)
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Select Workshops</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {workshops.map((workshop: any) => {
                const price = workshop.workshopPrices?.[0]?.amount || 0;
                const discountedPrice = familyOrder > 1 ? price * (1 - activeSeason.discountPercent/100) : price;
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
                          ({activeSeason.discountPercent}% discount)
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