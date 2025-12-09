'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMembers } from '@/hooks/useMembers';
import { DataTable, Button, SearchInput, Card } from '@/components/ui';

export default function MembersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { members, isLoading } = useMembers(search);

  const columns = [
    {
      key: 'lastName',
      label: 'Last Name',
    },
    {
      key: 'firstName',
      label: 'First Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'family',
      label: 'Family',
      render: (member: any) => member.family?.name || '-',
    },
    {
      key: 'isMinor',
      label: 'Minor',
      render: (member: any) => (member.isMinor ? 'Yes' : 'No'),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Members</h1>
        <Button onClick={() => router.push('/members/new')}>
          Add Member
        </Button>
      </div>

      <Card className="mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search members by name or email..."
        />
      </Card>

      <DataTable
        data={members}
        columns={columns}
        onRowClick={(member) => router.push(`/members/${member.id}`)}
        isLoading={isLoading}
        emptyMessage="No members found"
      />
    </div>
  );
}