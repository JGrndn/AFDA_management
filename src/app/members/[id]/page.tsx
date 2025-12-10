'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMember } from '@/hooks/useMembers';
import { useMemberMutations } from '@/hooks/useMutations';
import { MemberForm } from '@/components/members/MemberForm';
import { WorkshopRegistrationManager } from '@/components/members/WorkshopRegistrationManager';
import { MembershipManager } from '@/components/members/MembershipManager';
import { Button, Card, StatusBadge } from '@/components/ui';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
      <Link
        href="/members"
        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {member.firstName} {member.lastName}
          </h1>
          {/* Indicateur d'adhésion à la saison active */}
          {(() => {
            // Trouver la saison active
            const activeSeason = member.memberships?.find(
              (m: any) => m.season.isActive
            );
            
            if (activeSeason) {
              return (
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge 
                    status={activeSeason.status === 'validated' ? 'active' : 'pending'}
                  />
                  <span className="text-sm text-gray-600">
                    {activeSeason.status === 'validated' 
                      ? `Active member - ${activeSeason.season.label}`
                      : `Membership pending validation - ${activeSeason.season.label}`
                    }
                  </span>
                </div>
              );
            } else {
              return (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    No active membership
                  </span>
                </div>
              );
            }
          })()}
        </div>
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

          <Card title="Registrations">
            {member.registrations && member.registrations.length > 0 ? (
              <div className="space-y-4">
                {member.registrations
                  .sort((a: any, b: any) => b.season.startYear - a.season.startYear)
                  .map((reg: any) => (
                    <div key={reg.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{reg.season.label}</h4>
                          <div className="text-sm text-gray-500 mt-1">
                            Family Order: {reg.familyOrder}
                            {reg.familyOrder > 1 && (
                              <span className="ml-2 text-green-600">(10% discount)</span>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={reg.status} />
                      </div>
                      
                      {reg.workshopRegistrations.length > 0 ? (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Workshops:</h5>
                          <ul className="space-y-2">
                            {reg.workshopRegistrations.map((wr: any) => (
                              <li key={wr.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <span className="text-sm">{wr.workshop.name}</span>
                                <div className="text-sm text-right">
                                  <span className="font-semibold">€{Number(wr.appliedPrice).toFixed(2)}</span>
                                  {wr.discountPercent > 0 && (
                                    <span className="ml-2 text-xs text-green-600">
                                      (-{wr.discountPercent}%)
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No workshops selected</p>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">No registrations yet</p>
            )}
          </Card>

          <WorkshopRegistrationManager 
            member={member} 
            onUpdate={mutate}
          />

          <MembershipManager 
            member={member} 
            onUpdate={mutate}
          />
        </div>
      )}
    </div>
  );
}