'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShowClient } from '@/hooks/useShowClients';
import { useShowClientMutations } from '@/hooks/useMutations';
import { ShowClientForm } from '@/components/shows/ShowClientForm';
import { Button, Card } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ShowClientDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const clientId = parseInt(resolvedParams.id);
  const { showClient, isLoading: clientLoading, mutate } = useShowClient(clientId);
  const { 
    updateShowClient, 
    deleteShowClient, 
    isLoading: mutationLoading, 
    error 
  } = useShowClientMutations();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (data: any) => {
    const result = await updateShowClient(clientId, data);
    if (result) {
      setIsEditing(false);
      mutate();
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this client?')) {
      const result = await deleteShowClient(clientId);
      if (result) {
        router.push('/shows/clients');
      }
    }
  };

  if (clientLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!showClient) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <p>Client not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Link
        href="/shows/clients"
        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">{showClient.name}</h1>
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
        <ShowClientForm
          initialData={showClient}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={mutationLoading}
        />
      ) : (
        <div className="space-y-6">
          <Card title="Client Information">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {showClient.contactName || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{showClient.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{showClient.phone || '-'}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{showClient.address || '-'}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Shows">
            {showClient.shows && showClient.shows.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {showClient.shows.map((show: any) => (
                  <li 
                    key={show.id} 
                    className="py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/shows/${show.id}`)}
                  >
                    <div>
                      <div className="font-medium">{show.name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(show.date).toLocaleDateString()}
                        {show.location && ` • ${show.location}`}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No shows yet</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}