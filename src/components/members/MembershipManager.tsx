'use client';

import { useState } from 'react';
import { Card, Button, Modal, StatusBadge } from '@/components/ui';
import { useSeasons } from '@/hooks/useSeasons';

interface MembershipManagerProps {
  member: any;
  onUpdate: () => void;
}

export function MembershipManager({ member, onUpdate }: MembershipManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { seasons } = useSeasons();

  // IDs des saisons où le membre a déjà une adhésion
  const membershipSeasonIds = member.memberships?.map((m: any) => m.seasonId) || [];

  // Saisons disponibles pour créer une nouvelle adhésion
  const availableSeasons = seasons.filter(
    (season: any) => !membershipSeasonIds.includes(season.id)
  );

  const handleOpenModal = () => {
    setSelectedSeasonId(availableSeasons[0]?.id || null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedSeasonId) return;

    setIsLoading(true);
    setError(null);

    try {
      const season = seasons.find((s: any) => s.id === selectedSeasonId);
      
      const response = await fetch('/api/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          seasonId: selectedSeasonId,
          amount: season?.membershipAmount,
          status: 'pending',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create membership');
      }

      setIsModalOpen(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card 
        title="Memberships"
        actions={
          availableSeasons.length > 0 && (
            <Button size="sm" onClick={handleOpenModal}>
              Add Membership
            </Button>
          )
        }
      >
        {member.memberships && member.memberships.length > 0 ? (
          <div className="space-y-3">
            {member.memberships
              .sort((a: any, b: any) => b.season.startYear - a.season.startYear)
              .map((membership: any) => (
                <div key={membership.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{membership.season.label}</h4>
                    <div className="text-sm text-gray-500 mt-1">
                      Membership Date: {new Date(membership.membershipDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">€{Number(membership.amount).toFixed(2)}</div>
                    <StatusBadge status={membership.status} />
                  </div>
                </div>
              ))}
          </div>
        ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-900">No membership</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Click the button above to create a membership for this member this member.
                    </p>
                  </div>
                </div>
              </div>
            )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Membership"
        size="md"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-1">
              {member.firstName} {member.lastName}
            </h3>
            <p className="text-sm text-blue-800">
              Create a membership for this member
            </p>
          </div>

          {availableSeasons.length > 0 ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Season
                </label>
                <select
                  value={selectedSeasonId || ''}
                  onChange={(e) => setSelectedSeasonId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {availableSeasons.map((season: any) => (
                    <option key={season.id} value={season.id}>
                      {season.label} - €{Number(season.membershipAmount).toFixed(2)}
                      {season.isActive && ' (Active)'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSeasonId && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Membership Amount</span>
                    <span className="text-xl font-bold text-gray-900">
                      €{Number(seasons.find((s: any) => s.id === selectedSeasonId)?.membershipAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

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
                  disabled={isLoading || !selectedSeasonId}
                  className="flex-1"
                >
                  {isLoading ? 'Creating...' : 'Create Membership'}
                </Button>
              </div>
            </>
          ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-900">No membership</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Click the button above to create a membership for this member this member.
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>
      </Modal>
    </>
  );
}