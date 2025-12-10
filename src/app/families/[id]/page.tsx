'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/hooks/useFamilies';
import { useFamilyMutations } from '@/hooks/useMutations';
import { FamilyForm } from '@/components/families/FamilyForm';
import { Button, Card } from '@/components/ui';

export default function FamilyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const familyId = parseInt(params.id);
  const { family, isLoading: familyLoading, mutate } = useFamily(familyId);
  const { updateFamily, deleteFamily, isLoading: mutationLoading, error } = useFamilyMutations();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (data: any) => {
    const result = await updateFamily(familyId, data);
    if (result) {
      setIsEditing(false);
      mutate();
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this family? Members will not be deleted but will be unlinked from this family.')) {
      const result = await deleteFamily(familyId);
      if (result) {
        router.push('/families');
      }
    }
  };

  if (familyLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <p>Family not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">{family.name}</h1>
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
        <FamilyForm
          initialData={family}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={mutationLoading}
        />
      ) : (
        <div className="space-y-6">
          <Card title="Family Information">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{family.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{family.phone || '-'}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{family.address || '-'}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Family Members">
            {family.members && family.members.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {family.members.map((member: any) => (
                  <li 
                    key={member.id} 
                    className="py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/members/${member.id}`)}
                  >
                    <div>
                      <div className="font-medium">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.isMinor ? 'Minor' : 'Adult'}
                        {member.email && ` • ${member.email}`}
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
                <p className="text-gray-500 mb-4">No members in this family yet</p>
                <Button onClick={() => router.push('/members/new')}>
                  Add Member
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}