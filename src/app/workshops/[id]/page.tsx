'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkshop } from '@/hooks/useWorkshops';
import { useWorkshopMutations } from '@/hooks/useMutations';
import { WorkshopForm } from '@/components/workshops/WorkshopForm';
import { Button, Card, StatusBadge } from '@/components/ui';

export default function WorkshopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const workshopId = parseInt(resolvedParams.id);
  const { workshop, isLoading: workshopLoading, mutate } = useWorkshop(workshopId);
  const { updateWorkshop, deleteWorkshop, isLoading: mutationLoading, error } = useWorkshopMutations();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (data: any) => {
    const result = await updateWorkshop(workshopId, data);
    if (result) {
      setIsEditing(false);
      mutate();
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this workshop? This will also delete all related registrations.')) {
      const result = await deleteWorkshop(workshopId);
      if (result) {
        router.push('/workshops');
      }
    }
  };

  if (workshopLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <p>Workshop not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {workshop.name}
            {workshop.isActive && (
              <StatusBadge status="active" />
            )}
          </h1>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
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
        <WorkshopForm
          initialData={workshop}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={mutationLoading}
        />
      ) : (
        <div className="space-y-6">
          <Card title="Workshop Information">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{workshop.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={workshop.isActive ? 'active' : 'inactive'} />
                </dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{workshop.description || '-'}</dd>
              </div>
            </dl>
          </Card>

          {workshop.workshopPrices && workshop.workshopPrices.length > 0 && (
            <Card title="Prices by Season">
              <div className="space-y-2">
                {workshop.workshopPrices
                  .sort((a: any, b: any) => b.season.startYear - a.season.startYear)
                  .map((price: any) => (
                    <div key={price.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{price.season.label}</div>
                        {price.season.isActive && (
                          <span className="text-xs text-green-600">Active season</span>
                        )}
                      </div>
                      <div className="text-lg font-semibold">
                        €{Number(price.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}