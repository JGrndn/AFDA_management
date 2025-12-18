'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, StatusBadge } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const CLIENT_TYPES: Record<string, { label: string; icon: string }> = {
  individual: { label: 'Particulier', icon: '👤' },
  company: { label: 'Entreprise', icon: '🏢' },
  municipality: { label: 'Mairie', icon: '🏛️' },
  school: { label: 'École', icon: '🎓' },
};

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const clientId = parseInt(resolvedParams.id);

  const { data: client, isLoading } = useSWR(`/api/shows/clients/${clientId}`, fetcher);
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <p>Client non trouvé</p>
        </Card>
      </div>
    );
  }

  const typeInfo = CLIENT_TYPES[client.type] || { label: client.type, icon: '❓' };
  const totalRevenue = client.payments?.reduce(
    (sum: number, p: any) => sum + Number(p.amount),
    0
  ) || 0;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Link
        href="/shows/clients"
        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux clients
      </Link>

      <div className="mb-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{typeInfo.icon}</span>
            <h1 className="text-3xl font-bold">{client.name}</h1>
          </div>
          <p className="text-gray-600">{typeInfo.label}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/shows/new?clientId=${clientId}`)}>
            ➕ Nouvelle proposition
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">🎭</div>
            <div className="text-2xl font-bold">{client.shows?.length || 0}</div>
            <div className="text-sm text-gray-600">Spectacles</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold">{client.payments?.length || 0}</div>
            <div className="text-sm text-gray-600">Paiements</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">💵</div>
            <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Chiffre d'affaires</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations contact */}
        <Card title="Informations de contact">
          <dl className="space-y-3">
            {client.contactName && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Personne de contact</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.contactName}</dd>
              </div>
            )}
            {client.email && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.email}</dd>
              </div>
            )}
            {client.phone && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.phone}</dd>
              </div>
            )}
            {client.address && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                  {client.address}
                </dd>
              </div>
            )}
            {client.notes && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                  {client.notes}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Historique des spectacles */}
        <Card title="Historique des spectacles">
          {client.shows && client.shows.length > 0 ? (
            <div className="space-y-2">
              {client.shows.map((show: any) => (
                <div
                  key={show.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/shows/${show.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">{show.title}</div>
                      {show.confirmedDate || show.proposedDate ? (
                        <div className="text-sm text-gray-600">
                          {new Date(
                            show.confirmedDate || show.proposedDate
                          ).toLocaleDateString('fr-FR')}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold text-sm mb-1">
                        €{Number(show.agreedPrice || show.proposedPrice).toFixed(2)}
                      </div>
                      <StatusBadge
                        status={show.status}
                        colorMap={{
                          pending: getStatusColor('pending'),
                          confirmed: getStatusColor('confirmed'),
                          rejected: getStatusColor('rejected'),
                          expired: getStatusColor('expired'),
                          completed: getStatusColor('completed'),
                          cancelled: getStatusColor('cancelled'),
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun spectacle enregistré</p>
          )}
        </Card>
      </div>
    </div>
  );
}