'use client';

import { useRouter } from 'next/navigation';
import { useWorkshops } from '@/hooks/useWorkshops';
import { DataTable, Button, StatusBadge } from '@/components/ui';

export default function WorkshopsPage() {
  const router = useRouter();
  const { workshops, isLoading } = useWorkshops();

  const columns = [
    {
      key: 'name',
      label: 'Workshop Name',
    },
    {
      key: 'description',
      label: 'Description',
      render: (workshop: any) => workshop.description?.slice(0, 50) + '...' || '-',
    },
    {
      key: 'registrations',
      label: 'Registrations',
      render: (workshop: any) => workshop._count?.workshopRegistrations || 0,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (workshop: any) => (
        <StatusBadge status={workshop.isActive ? 'active' : 'inactive'} />
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workshops</h1>
        <Button onClick={() => router.push('/workshops/new')}>
          Add Workshop
        </Button>
      </div>

      <DataTable
        data={workshops}
        columns={columns}
        onRowClick={(workshop: any) => router.push(`/workshops/${workshop.id}`)}
        isLoading={isLoading}
        emptyMessage="No workshops found"
      />
    </div>
  );
}