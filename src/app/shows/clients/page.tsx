'use client';

import { useRouter } from 'next/navigation';
import { DataTable, Button, Card } from '@/components/ui';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ShowClientsPage() {
  const router = useRouter();
  const { data: clients = [], isLoading } = useSWR('/api/shows/clients', fetcher);

  const columns = [
    {
      key: 'name',
      label: 'Nom',
      render: (client: any) => (
        <div>
          <div className="font-medium">{client.name}</div>
          {client.contactName && (
            <div className="text-xs text-gray-500">{client.contactName}</div>
          )}
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (client: any) => (
        <div className="text-sm">
          {client.email && <div>{client.email}</div>}
          {client.phone && <div className="text-gray-600">{client.phone}</div>}
          {!client.email && !client.phone && <span className="text-gray-400">-</span>}
        </div>
      ),
    },
    {
      key: 'shows',
      label: 'Spectacles',
      render: (client: any) => (
        <div className="text-center">
          <div className="font-semibold">{client._count?.shows || 0}</div>
        </div>
      ),
    },
    {
      key: 'payments',
      label: 'Paiements',
      render: (client: any) => (
        <div className="text-center">
          <div className="font-semibold">{client._count?.payments || 0}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clients Spectacles</h1>
        <Button onClick={() => router.push('/shows/clients/new')}>
          ➕ Nouveau client
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={clients}
        columns={columns}
        onRowClick={(client: any) => router.push(`/shows/clients/${client.id}`)}
        isLoading={isLoading}
        emptyMessage="Aucun client enregistré"
      />
    </div>
  );
}