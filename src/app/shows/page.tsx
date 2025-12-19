'use client';

import { useRouter } from 'next/navigation';
import { useShows } from '@/hooks/useShows';
import { DataTable, Button, StatusBadge } from '@/components/ui';

export default function ShowsPage() {
  const router = useRouter();
  const { shows, isLoading } = useShows();

  const columns = [
    {
      key: 'name',
      label: 'Show Name',
      render: (show:any) => show.title
    },
    {
      key: 'date',
      label: 'Date',
      render: (show: any) => show.proposedDate? new Date(show.proposedDate).toLocaleDateString(): '-',
    },
    {
      key: 'price',
      label: 'Prix',
      render: (show: any) => `${show.proposedPrice} €`,
    },
    {
      key: 'client',
      label: 'Client',
      render: (show: any) => show.client?.name || '-',
    },
    {
      key: 'status',
      label: 'Statut',
      render: (show: any) => <StatusBadge status={show.status} type="show"/>,
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shows</h1>
        <Button onClick={() => router.push('/shows/new')}>
          Add Show
        </Button>
      </div>

      <DataTable
        data={shows}
        columns={columns}
        onRowClick={(show: any) => router.push(`/shows/${show.id}`)}
        isLoading={isLoading}
        emptyMessage="No shows found"
      />
    </div>
  );
}