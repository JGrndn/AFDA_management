'use client';

import { useRouter } from 'next/navigation';
import { useSeasons } from '@/hooks/useSeasons';
import { DataTable, Button, StatusBadge } from '@/components/ui';

export default function SeasonsPage() {
  const router = useRouter();
  const { seasons, isLoading } = useSeasons();

  const columns = [
    {
      key: 'label',
      label: 'Season',
    },
    {
      key: 'years',
      label: 'Years',
      render: (season: any) => `${season.startYear}-${season.endYear}`,
    },
    {
      key: 'membershipAmount',
      label: 'Membership',
      render: (season: any) => `€${season.membershipAmount}`,
    },
    {
      key: 'registrations',
      label: 'Registrations',
      render: (season: any) => season._count?.registrations || 0,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (season: any) => (
        <StatusBadge status={season.isActive ? 'active' : 'inactive'} />
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Seasons</h1>
        <Button onClick={() => router.push('/seasons/new')}>
          Add Season
        </Button>
      </div>

      <DataTable
        data={seasons}
        columns={columns}
        onRowClick={(season: any) => router.push(`/seasons/${season.id}`)}
        isLoading={isLoading}
        emptyMessage="No seasons found"
      />
    </div>
  );
}