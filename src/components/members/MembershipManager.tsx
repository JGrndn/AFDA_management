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
  const [validatingId, setValidatingId] = useState<number | null>(null);

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

  const handleValidate = async (membershipId: number) => {
    setValidatingId(membershipId);

    try {
      const response = await fetch(`/api/memberships/${membershipId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'validated',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to validate membership');
      }

      onUpdate();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setValidatingId(null);
    }
  };

  const sortedMemberships = member.memberships
    ? [...member.memberships].sort((a: any, b: any) => b.season.startYear - a.season.startYear)
    : [];

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
        {sortedMemberships.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Season
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedMemberships.map((membership: any) => (
                  <tr key={membership.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {membership.season.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">
                        €{Number(membership.amount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(membership.membershipDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={membership.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {membership.status !== 'validated' && (
                        <Button
                          size="sm"
                          onClick={() => handleValidate(membership.id)}
                          disabled={validatingId === membership.id}
                        >
                          {validatingId === membership.id ? 'Validating...' : 'Validate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No memberships yet</p>
            {availableSeasons.length > 0 && (
              <Button onClick={handleOpenModal}>
                Create First Membership
              </Button>
            )}
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
            <div className="text-center py-4">
              <p className="text-gray-600">All available seasons already have memberships for this member.</p>
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}