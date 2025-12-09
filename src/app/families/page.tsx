'use client';

import { useRouter } from 'next/navigation';
import { useFamilies } from '@/hooks/useFamilies';
import { DataTable, Button } from '@/components/ui';

export default function FamiliesPage() {
  const router = useRouter();
  const { families, isLoading } = useFamilies();

  const columns = [
    {
      key: 'name',
      label: 'Family Name',
    },
    {
      key: 'email',
      label: 'Email',
      render: (family: any) => family.email || '-',
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (family: any) => family.phone || '-',
    },
    {
      key: 'members',
      label: 'Members',
      render: (family: any) => family._count?.members || 0,
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Families</h1>
        <Button onClick={() => router.push('/families/new')}>
          Add Family
        </Button>
      </div>

      <DataTable
        data={families}
        columns={columns}
        onRowClick={(family: any) => router.push(`/families/${family.id}`)}
        isLoading={isLoading}
        emptyMessage="No families found"
      />
    </div>
  );
}