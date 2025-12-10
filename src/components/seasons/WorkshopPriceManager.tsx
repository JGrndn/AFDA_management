'use client';

import { useState } from 'react';
import { Card, Button, Modal } from '@/components/ui';

interface WorkshopPriceManagerProps {
  season: any;
  workshops: any[];
  onUpdate: () => void;
}

export function WorkshopPriceManager({ season, workshops, onUpdate }: WorkshopPriceManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prices, setPrices] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenModal = () => {
    // Initialiser les prix existants
    const existingPrices: Record<number, number> = {};
    season.workshopPrices?.forEach((wp: any) => {
      existingPrices[wp.workshopId] = Number(wp.amount);
    });
    setPrices(existingPrices);
    setIsModalOpen(true);
  };

  const updatePrice = (workshopId: number, price: number) => {
    setPrices((prev) => ({
      ...prev,
      [workshopId]: price,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Sauvegarder tous les prix via l'API
      await Promise.all(
        Object.entries(prices).map(async ([workshopId, amount]) => {
          if (amount > 0) {
            const response = await fetch(`/api/workshops/${workshopId}/price`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                seasonId: season.id,
                amount,
              }),
            });

            if (!response.ok) {
              throw new Error(`Failed to set price for workshop ${workshopId}`);
            }
          }
        })
      );

      setIsModalOpen(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to save prices');
    } finally {
      setIsLoading(false);
    }
  };

  const workshopsWithPrices = workshops.map((workshop) => {
    const existingPrice = season.workshopPrices?.find(
      (wp: any) => wp.workshopId === workshop.id
    );
    return {
      ...workshop,
      currentPrice: existingPrice ? Number(existingPrice.amount) : null,
    };
  });

  return (
    <>
      <Card 
        title="Workshop Prices"
        actions={
          <Button size="sm" onClick={handleOpenModal}>
            Manage Prices
          </Button>
        }
      >
        {workshopsWithPrices.length > 0 ? (
          <div className="space-y-2">
            {workshopsWithPrices.map((workshop: any) => (
              <div
                key={workshop.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">{workshop.name}</div>
                  {workshop.description && (
                    <div className="text-sm text-gray-500">{workshop.description}</div>
                  )}
                </div>
                <div className="text-right">
                  {workshop.currentPrice !== null ? (
                    <div className="font-semibold text-lg">
                      €{workshop.currentPrice.toFixed(2)}
                    </div>
                  ) : (
                    <div className="text-sm text-red-600">No price set</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No workshops available</p>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Set Workshop Prices - ${season.label}`}
        size="lg"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Set the price for each workshop for the season <strong>{season.label}</strong>.
              Leave blank or 0 to not offer the workshop this season.
            </p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {workshops.map((workshop: any) => (
              <div key={workshop.id} className="border rounded-lg p-4">
                <label className="block">
                  <div className="font-medium mb-1">{workshop.name}</div>
                  {workshop.description && (
                    <div className="text-sm text-gray-500 mb-2">{workshop.description}</div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">€</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={prices[workshop.id] || ''}
                      onChange={(e) =>
                        updatePrice(workshop.id, parseFloat(e.target.value) || 0)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </label>
              </div>
            ))}
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
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Prices'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}