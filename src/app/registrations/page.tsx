'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useActiveSeason } from '@/hooks/useSeasons';
import { DataTable, Button, StatusBadge, Card } from '@/components/ui';

export default function RegistrationsPage() {
  const router = useRouter();
  const { season: activeSeason } = useActiveSeason();
  const { registrations, isLoading } = useRegistrations(activeSeason?.id);

  const columns = [
    {
      key: 'member',
      label: 'Member',
      render: (reg: any) => `${reg.member.firstName} ${reg.member.lastName}`,
    },
    {
      key: 'family',
      label: 'Family',
      render: (reg: any) => reg.member.family?.name || '-',
    },
    {
      key: 'workshops',
      label: 'Workshops',
      render: (reg: any) => reg.workshopRegistrations.length,
    },
    {
      key: 'familyOrder',
      label: 'Order',
      render: (reg: any) => (
        <span className={reg.familyOrder > 1 ? 'text-green-600' : ''}>
          {reg.familyOrder}
          {reg.familyOrder > 1 && ' (discount)'}
        </span>
      ),
    },
    {
      key: 'registrationDate',
      label: 'Date',
      render: (reg: any) => new Date(reg.registrationDate).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (reg: any) => <StatusBadge status={reg.status} />,
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Registrations</h1>
        <Button onClick={() => router.push('/registrations/new')}>
          New Registration
        </Button>
      </div>

      {activeSeason && (
        <Card className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Active Season</h3>
              <p className="text-gray-600">{activeSeason.label}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Registrations</div>
              <div className="text-2xl font-bold">{registrations.length}</div>
            </div>
          </div>
        </Card>
      )}

      <DataTable
        data={registrations}
        columns={columns}
        onRowClick={(reg: any) => router.push(`/registrations/${reg.id}`)}
        isLoading={isLoading}
        emptyMessage="No registrations found"
      />
    </div>
  );
}