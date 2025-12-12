import { Prisma } from '@/generated/prisma/client';

export type SeasonWithRelations = Prisma.SeasonGetPayload<{
  include: {
    registrations: true;
    workshopPrices: { include: { workshop: true } };
    memberships: true;
  };
}>;

export type MemberWithRelations = Prisma.MemberGetPayload<{
  include: {
    family: true;
    registrations: {
      include: {
        season: true;
        workshopRegistrations: { include: { workshop: true } };
      };
    };
    memberships: { include: { season: true } };
  };
}>;

export type RegistrationWithRelations = Prisma.RegistrationGetPayload<{
  include: {
    member: { include: { family: true } };
    season: true;
    workshopRegistrations: { include: { workshop: true } };
  };
}>;

export const PAYMENT_TYPES = ['cash', 'check', 'transfer', 'card'] as const;
export const PAYMENT_STATUS = ['pending', 'cashed', 'cancelled'] as const;

export type PaymentType = typeof PAYMENT_TYPES[number];
export type PaymentStatus = typeof PAYMENT_STATUS[number];

export interface PaymentStatusInfo {
  totalDue: number;
  totalPaid: number;
  balance: number;
  donation: number;
  isFullyPaid: boolean;
  status: 'validated' | 'partial' | 'unpaid';
}