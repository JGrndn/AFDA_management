'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSeason } from '@/hooks/useSeasons';
import { useWorkshops } from '@/hooks/useWorkshops';
import { useSeasonMutations } from '@/hooks/useMutations';
import { SeasonForm } from '@/components/seasons/SeasonForm';
import { WorkshopPriceManager } from '@/components/seasons/WorkshopPriceManager';
import { Button, Card, StatusBadge } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SeasonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const seasonId = parseInt(resolvedParams.id);
  const { season, isLoading: seasonLoading, mutate } = useSeason(seasonId);
  const { workshops } = useWorkshops();
  const { updateSeason, deleteSeason, isLoading: mutationLoading, error } = useSeasonMutations();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (data: any) => {
    const result = await updateSeason(seasonId, data);
    if (result) {
      setIsEditing(false);
      mutate();
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this season? This will also delete all related registrations.')) {
      const result = await deleteSeason(seasonId);
      if (result) {
        router.push('/seasons');
      }
    }
  };

  const handleSetActive = async () => {
    const result = await updateSeason(seasonId, { isActive: true });
    if (result) {
      mutate();
    }
  };

  if (seasonLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <p>Season not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Link
        href="/seasons"
        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {season.label}
            {season.isActive && (
              <StatusBadge status="active" />
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            {season.startYear} - {season.endYear}
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              {!season.isActive && (
                <Button onClick={handleSetActive} variant="primary">
                  Set as Active
                </Button>
              )}
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {isEditing ? (
        <SeasonForm
          initialData={season}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={mutationLoading}
        />
      ) : (
        <div className="space-y-6">
          <Card title="Season Information">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Label</dt>
                <dd className="mt-1 text-sm text-gray-900">{season.label}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Period</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {season.startYear} - {season.endYear}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Membership Amount</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">
                  {Number(season.membershipAmount).toFixed(2)} €
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={season.isActive ? 'active' : 'inactive'} />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Discount</dt>
                <dd className="mt-1">
                  {season.discountPercent} %
                </dd>
              </div>
            </dl>
          </Card>

          <WorkshopPriceManager 
            season={season} 
            workshops={workshops}
            onUpdate={mutate}
          />
        </div>
      )}
    </div>
  );
}