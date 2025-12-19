'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShow } from '@/hooks/useShows';
import { useShowMutations } from '@/hooks/useMutations';
import { ShowForm } from '@/components/shows/ShowForm';
import { Button, Card, StatusBadge } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ShowDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const showId = parseInt(resolvedParams.id);
  const { show, isLoading: showLoading, mutate } = useShow(showId);
  const { updateShow, deleteShow, isLoading: mutationLoading, error } = useShowMutations();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (data: any) => {
    const result = await updateShow(showId, data);
    if (result) {
      setIsEditing(false);
      mutate();
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this show?')) {
      const result = await deleteShow(showId);
      if (result) {
        router.push('/shows');
      }
    }
  };

  if (showLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <p>Show not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Link
        href="/shows"
        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">{show.name}</h1>
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
        <ShowForm
          initialData={show}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={mutationLoading}
        />
      ) : (
        <div className="space-y-6">
          <Card title="Show Information">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(show.date).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{show.location || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Client</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {show.showClient ? (
                    <button
                      onClick={() => router.push(`/shows/clients/${show.showClient.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      {show.showClient.name}
                    </button>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{show.description || '-'}</dd>
              </div>
            </dl>
          </Card>

        </div>
      )}
    </div>
  );
}