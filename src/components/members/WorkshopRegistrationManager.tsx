'use client';

import { useState } from 'react';
import { Card, Button, Modal } from '@/components/ui';
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
  const [workshopQuantities, setWorkshopQuantities] = useState<Record<number, number>>({});
  const [familyOrder, setFamilyOrder] = useState(1);
  
  const { season: activeSeason } = useActiveSeason();
  const { workshops } = useWorkshops({ seasonId: activeSeason?.id });
  const { createRegistration, updateWorkshops, isLoading, error } = useRegistrationMutations();

  const activeRegistration = member.registrations?.find(
    (reg: any) => reg.seasonId === activeSeason?.id
  );

  const hasMembership = member.memberships?.some(
    (m: any) => m.seasonId === activeSeason?.id && 
                ['pending', 'validated'].includes(m.status)
  );

  const handleOpenModal = () => {
    // Initialiser les quantités depuis l'inscription existante
    const quantities: Record<number, number> = {};
    activeRegistration?.workshopRegistrations.forEach((wr: any) => {
      quantities[wr.workshopId] = wr.quantity;
    });
    setWorkshopQuantities(quantities);
    setFamilyOrder(activeRegistration?.familyOrder || 1);
    setIsModalOpen(true);
  };

  const updateQuantity = (workshopId: number, quantity: number) => {
    setWorkshopQuantities((prev) => {
      const updated = { ...prev };
      if (quantity <= 0) {
        delete updated[workshopId];
      } else {
        updated[workshopId] = quantity;
      }
      return updated;
    });
  };

  const calculateTotal = () => {
    if (!activeSeason || !workshops) return 0;
    
    const eligibleForDiscount = familyOrder > 1 && hasMembership;
    
    const workshopTotal = Object.entries(workshopQuantities).reduce((sum, [workshopIdStr, quantity]) => {
      const workshopId = parseInt(workshopIdStr);
      const workshop = workshops.find((w: any) => w.id === workshopId);
      if (!workshop) return sum;
      
      const price = workshop.workshopPrices?.[0]?.amount || 0;
      const discount = eligibleForDiscount ? (1-activeSeason.discountPercent/100) : 1;
      return sum + (Number(price) * discount * quantity);
    }, 0);

    return workshopTotal;
  };

  const handleSubmit = async () => {
    if (!activeSeason) return;
    
    // Convertir en format attendu par l'API
    const workshopQuantitiesArray = Object.entries(workshopQuantities).map(([workshopId, quantity]) => ({
      workshopId: parseInt(workshopId),
      quantity
    }));

    let result;
    if (activeRegistration){
      result = await updateWorkshops(
        activeRegistration.id,
        workshopQuantitiesArray,
        familyOrder
      );
    } else {
      result = await createRegistration({
        memberId: member.id,
        seasonId: activeSeason.id,
        workshopQuantities: workshopQuantitiesArray,
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
                      {activeRegistration.familyOrder > 1 && hasMembership && (
                        <span className="ml-2 text-green-600">({activeRegistration.season.discountPercent}% discount applied)</span>
                      )}
                      {activeRegistration.familyOrder > 1 && !hasMembership && (
                        <span className="ml-2 text-yellow-600">(no discount - no membership)</span>
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
                          <div className="flex-1">
                            <span className="text-sm font-medium">{wr.workshop.name}</span>
                            {wr.quantity > 1 && (
                              <span className="ml-2 text-xs text-gray-600">× {wr.quantity}</span>
                            )}
                          </div>
                          <div className="text-sm text-right">
                            <span className="font-semibold">
                              €{(Number(wr.appliedPrice) * wr.quantity).toFixed(2)}
                            </span>
                            {wr.quantity > 1 && (
                              <div className="text-xs text-gray-500">
                                €{Number(wr.appliedPrice).toFixed(2)} each
                              </div>
                            )}
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
            {hasMembership ? (
              <p className="text-sm text-green-700 mt-1">
                ✓ Has membership for this season
              </p>
            ) : (
              <p className="text-sm text-yellow-700 mt-1">
                ⚠ No membership yet for this season
              </p>
            )}
          </div>

          {familyOrder > 1 && !hasMembership && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-yellow-800">
                  <strong>No membership yet:</strong> Family discount ({activeRegistration.season.discountPercent}%) will apply once you create a membership for this season.
                </div>
              </div>
            </div>
          )}

          {familyOrder > 1 && hasMembership && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-green-800 font-medium">
                  Family discount ({activeRegistration.season.discountPercent}%) applied - Member has active membership
                </span>
              </div>
            </div>
          )}

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
              Set to 1 for first family member, 2+ for siblings ({activeRegistration.season.discountPercent}% workshop discount if membership exists)
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Select Workshops</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {workshops.map((workshop: any) => {
                const price = workshop.workshopPrices?.[0]?.amount || 0;
                const eligibleForDiscount = familyOrder > 1 && hasMembership;
                const unitPrice = eligibleForDiscount ? price * (1 - activeRegistration.season.discountPercent/100) : price;
                const quantity = workshopQuantities[workshop.id] || 0;
                const totalPrice = unitPrice * quantity;

                return (
                  <div
                    key={workshop.id}
                    className={`border rounded-lg p-4 ${
                      quantity > 0 ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{workshop.name}</div>
                        {workshop.description && (
                          <div className="text-sm text-gray-500">{workshop.description}</div>
                        )}
                        {workshop.allowMultiple && (
                          <div className="mt-1 flex items-center text-xs text-blue-600">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                            </svg>
                            Multiple registrations allowed
                            {workshop.maxPerMember && ` (max ${workshop.maxPerMember})`}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-semibold">€{Number(price).toFixed(2)}</div>
                        {eligibleForDiscount && (
                          <div className="text-xs text-green-600">
                            €{unitPrice.toFixed(2)} with discount
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      {workshop.allowMultiple ? (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateQuantity(workshop.id, Math.max(0, quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100"
                            disabled={quantity <= 0}
                          >
                            −
                          </button>
                          <span className="font-semibold w-12 text-center">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (!workshop.maxPerMember || quantity < workshop.maxPerMember) {
                                updateQuantity(workshop.id, quantity + 1);
                              }
                            }}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100"
                            disabled={workshop.maxPerMember && quantity >= workshop.maxPerMember}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={quantity > 0}
                            onChange={(e) => updateQuantity(workshop.id, e.target.checked ? 1 : 0)}
                            className="h-4 w-4 text-blue-600 mr-2"
                          />
                          <span className="text-sm">Select</span>
                        </label>
                      )}
                      
                      {quantity > 0 && (
                        <div className="text-right">
                          <div className="font-bold text-blue-600">
                            €{totalPrice.toFixed(2)}
                          </div>
                          {quantity > 1 && (
                            <div className="text-xs text-gray-600">
                              €{unitPrice.toFixed(2)} × {quantity}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
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
              disabled={isLoading || Object.keys(workshopQuantities).length === 0}
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