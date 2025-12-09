'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMember } from '@/hooks/useMembers';
import { useMemberMutations } from '@/hooks/useMutations';
import { MemberForm } from '@/components/members/MemberForm';
import { WorkshopRegistrationManager } from '@/components/members/WorkshopRegistrationManager';
import { Button, Card, StatusBadge } from '@/components/ui';

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const memberId = parseInt(resolvedParams.id);
  const { member, isLoading: memberLoading, mutate } = useMember(memberId);
  const { updateMember, deleteMember, isLoading: mutationLoading, error } = useMemberMutations();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (data: any) => {
    const result = await updateMember(memberId, data);
    if (result) {
      setIsEditing(false);
      mutate(); // Rafraîchir les données
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this member?')) {
      const result = await deleteMember(memberId);
      if (result) {
        router.push('/members');
      }
    }
  };

  if (memberLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <p>Member not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {member.firstName} {member.lastName}
        </h1>
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
        <MemberForm
          initialData={member}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={mutationLoading}
        />
      ) : (
        <div className="space-y-6">
          <Card title="Personal Information">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.phone || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Family</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.family?.name || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Minor</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.isMinor ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </Card>

          {member.isMinor && (
            <Card title="Legal Guardian">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {member.guardianFirstName} {member.guardianLastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Relation</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.guardianRelation || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.guardianEmail || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.guardianPhone || '-'}</dd>
                </div>
              </dl>
            </Card>
          )}

          <WorkshopRegistrationManager 
            member={member} 
            onUpdate={mutate}
          />
        </div>
      )}
    </div>
  );
}