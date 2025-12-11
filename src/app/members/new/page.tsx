'use client';

import { useRouter } from 'next/navigation';
import { MemberForm } from '@/components/members/MemberForm';
import { useMemberMutations } from '@/hooks/useMutations';

export default function NewMemberPage() {
  const router = useRouter();
  const { createMember, isLoading, error } = useMemberMutations();

  const handleSubmit = async (data: any) => {
    const result:any = await createMember(data);
    if (result) {
      router.push(`/members/${result.id}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <MemberForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/members')}
        isLoading={isLoading}
      />
    </div>
  );
}