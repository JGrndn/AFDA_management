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

export interface PaymentStatusInfo {
  totalDue: number;
  totalPaid: number;
  balance: number;
  donation: number;
  isFullyPaid: boolean;
  status: 'validated' | 'partial' | 'unpaid';
}