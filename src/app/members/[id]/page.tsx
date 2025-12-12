'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMember } from '@/hooks/useMembers';
import { useMemberMutations } from '@/hooks/useMutations';
import { MemberForm } from '@/components/members/MemberForm';
import { WorkshopRegistrationManager } from '@/components/members/WorkshopRegistrationManager';
import { MembershipManager } from '@/components/members/MembershipManager';
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
                <dd className="mt-1 text-sm text-gray-900">
                  {member.family ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/families/${member.family.id}`)}
                        className="text-blue-600 hover:underline"
                      >
                        {member.family.name}
                      </button>
                      <button
                        onClick={() => router.push(`/families/${member.family.id}#payments`)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        (view payments)
                      </button>
                    </div>
                  ) : member.id ? (
                    <button
                      onClick={() => router.push(`/members/${member.id}/payments`)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View payments
                    </button>
                  ) : (
                    '-'
                  )}
                </dd>
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

          <MembershipManager 
            member={member} 
            onUpdate={mutate}
          />

          {/* Section Historique (saisons inactives) */}
          {(() => {
            const inactiveMemberships = member.memberships?.filter((m: any) => !m.season.isActive) || [];
            const inactiveRegistrations = member.registrations?.filter((r: any) => !r.season.isActive) || [];
            
            if (inactiveMemberships.length === 0 && inactiveRegistrations.length === 0) {
              return null;
            }

            return (
              <Card title="History">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <span className="font-medium text-gray-900">
                      View past seasons ({inactiveMemberships.length} membership{inactiveMemberships.length !== 1 ? 's' : ''}, {inactiveRegistrations.length} registration{inactiveRegistrations.length !== 1 ? 's' : ''})
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-500 transition group-open:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>

                  <div className="mt-4 space-y-6 p-4 border-t">
                    {/* Adhésions passées */}
                    {inactiveMemberships.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Past Memberships</h4>
                        <div className="space-y-2">
                          {inactiveMemberships
                            .sort((a: any, b: any) => b.season.startYear - a.season.startYear)
                            .map((membership: any) => (
                              <div key={membership.id} className="border rounded-lg p-3 bg-gray-50 flex justify-between items-center">
                                <div>
                                  <div className="font-medium text-sm">{membership.season.label}</div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(membership.membershipDate).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-sm">€{Number(membership.amount).toFixed(2)}</div>
                                  <StatusBadge status={membership.status} />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Inscriptions passées */}
                    {inactiveRegistrations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Past Workshop Registrations</h4>
                        <div className="space-y-3">
                          {inactiveRegistrations
                            .sort((a: any, b: any) => b.season.startYear - a.season.startYear)
                            .map((reg: any) => (
                              <div key={reg.id} className="border rounded-lg p-3 bg-gray-50">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div className="font-medium text-sm">{reg.season.label}</div>
                                    <div className="text-xs text-gray-500">
                                      Family Order: {reg.familyOrder}
                                      {reg.familyOrder > 1 && (
                                        <span className="ml-1 text-green-600">(10% discount)</span>
                                      )}
                                    </div>
                                  </div>
                                  <StatusBadge status={reg.status} />
                                </div>
                                
                                {reg.workshopRegistrations && reg.workshopRegistrations.length > 0 && (
                                  <div className="mt-2 pl-3 border-l-2 border-gray-300">
                                    <div className="text-xs font-medium text-gray-600 mb-1">Workshops:</div>
                                    <ul className="space-y-1">
                                      {reg.workshopRegistrations.map((wr: any) => (
                                        <li key={wr.id} className="text-xs text-gray-700 flex justify-between">
                                          <span>{wr.workshop.name}</span>
                                          <span className="font-semibold">€{Number(wr.appliedPrice).toFixed(2)}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              </Card>
            );
          })()}
        </div>
      )}
    </div>
  );
}