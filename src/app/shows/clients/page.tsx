'use client';

import { useRouter } from 'next/navigation';
import { useShowClients } from '@/hooks/useShowClients';
import { DataTable, Button } from '@/components/ui';

export default function ShowClientsPage() {
  const router = useRouter();
  const { showClients, isLoading } = useShowClients();

  const columns = [
    {
      key: 'name',
      label: 'Client Name',
    },
    {
      key: 'contactName',
      label: 'Contact Person',
      render: (client: any) => client.contactName || '-',
    },
    {
      key: 'email',
      label: 'Email',
      render: (client: any) => client.email || '-',
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (client: any) => client.phone || '-',
    },
    {
      key: 'shows',
      label: 'Shows',
      render: (client: any) => client._count?.shows || 0,
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Show Clients</h1>
        <Button onClick={() => router.push('/shows/clients/new')}>
          Add Client
        </Button>
      </div>

      <DataTable
        data={showClients}
        columns={columns}
        onRowClick={(client: any) => router.push(`/shows/clients/${client.id}`)}
        isLoading={isLoading}
        emptyMessage="No clients found"
      />
    </div>
  );
}