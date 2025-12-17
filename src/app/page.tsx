'use client';

import { useRouter } from 'next/navigation';
import { useMembers } from '@/hooks/useMembers';
import { useRegistrations } from '@/hooks/useRegistrations';
import { usePayments } from '@/hooks/usePayments';
import { useActiveSeason } from '@/hooks/useSeasons';
import { Card, Button, StatusBadge } from '@/components/ui';

export default function DashboardPage() {
  const router = useRouter();
  const { members } = useMembers();
  const { season: activeSeason } = useActiveSeason();
  const { registrations } = useRegistrations(activeSeason?.id);
  const { payments } = usePayments({ uncashedOnly: true });

  const stats = [
    {
      label: 'Total Members',
      value: members.length,
      icon: '👥',
      color: 'bg-blue-500',
      href: '/members',
    },
    
    {
      label: 'Uncashed Checks',
      value: payments.filter((p: any) => p.paymentType === 'check').length,
      icon: '💰',
      color: 'bg-yellow-500',
      href: '/payments',
    },
  ];

  const recentRegistrations = registrations.slice(0, 5);
  const recentPayments = payments.slice(0, 5);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to AFDA Management System</p>
      </div>

      {activeSeason && (
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-1">Active Season</h2>
              <p className="text-blue-100 text-lg">{activeSeason.label}</p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Membership Fee</div>
              <div className="text-3xl font-bold">€{activeSeason.membershipAmount}</div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="cursor-pointer hover:shadow-lg transition"
            onClick={() => router.push(stat.href)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`w-16 h-16 ${stat.color} rounded-full flex items-center justify-center text-3xl`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Recent Registrations"
          actions={
            <Button size="sm" onClick={() => router.push('/registrations')}>
              View All
            </Button>
          }
        >
          {recentRegistrations.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentRegistrations.map((reg: any) => (
                <li key={reg.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {reg.member.firstName} {reg.member.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {reg.workshopRegistrations.length} workshops
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={reg.status} />
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(reg.registrationDate).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No registrations yet</p>
          )}
        </Card>

        <Card
          title="Uncashed Checks"
          actions={
            <Button size="sm" onClick={() => router.push('/payments')}>
              View All
            </Button>
          }
        >
          {recentPayments.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentPayments.map((payment: any) => (
                <li key={payment.id} className="py-3 flex justify-between items-center">
                  <div className="text-right">
                    <div className="font-semibold">€{Number(payment.amount).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">All checks are cashed!</p>
          )}
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Quick Actions">
          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => router.push('/members/new')}
            >
              Add New Member
            </Button>
            <Button
              className="w-full"
              onClick={() => router.push('/registrations/new')}
            >
              New Registration
            </Button>
            <Button
              className="w-full"
              onClick={() => router.push('/payments/new')}
            >
              Record Payment
            </Button>
          </div>
        </Card>

        <Card title="System Status">
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-600">Total Members</dt>
              <dd className="font-semibold">{members.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Active Season</dt>
              <dd className="font-semibold">{activeSeason?.label || 'None'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Pending Registrations</dt>
              <dd className="font-semibold">
                {registrations.filter((r: any) => r.status === 'pending').length}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Uncashed Payments</dt>
              <dd className="font-semibold text-yellow-600">
                {payments.filter((p: any) => p.paymentType === 'check').length}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}