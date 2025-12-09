import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export const paymentService = {
  async getAll(filters?: { status?: string; uncashedOnly?: boolean }) {
    return prisma.paymentGroup.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.uncashedOnly && {
          cashingDate: null,
          paymentType: 'check',
        }),
      },
      include: {
        paymentRegistrations: {
          include: {
            registration: { include: { member: true, season: true } },
            workshopRegistration: { include: { workshop: true } },
          },
        },
        paymentMemberships: {
          include: {
            membership: { include: { member: true, season: true } },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
  },

  async getById(id: number) {
    return prisma.paymentGroup.findUnique({
      where: { id },
      include: {
        paymentRegistrations: {
          include: {
            registration: { include: { member: true, season: true } },
            workshopRegistration: { include: { workshop: true } },
          },
        },
        paymentMemberships: {
          include: {
            membership: { include: { member: true, season: true } },
          },
        },
      },
    });
  },

  async create(data: {
    paymentType: string;
    paymentDate: Date;
    totalAmount: number;
    reference?: string;
    notes?: string;
    registrations?: Array<{
      registrationId: number;
      allocatedAmount: number;
      amountType: string;
      workshopRegistrationId?: number;
    }>;
    memberships?: Array<{
      membershipId: number;
      allocatedAmount: number;
    }>;
  }) {
    return prisma.paymentGroup.create({
      data: {
        paymentType: data.paymentType,
        paymentDate: data.paymentDate,
        totalAmount: data.totalAmount,
        reference: data.reference,
        notes: data.notes,
        status: 'pending',
        paymentRegistrations: data.registrations
          ? {
              create: data.registrations,
            }
          : undefined,
        paymentMemberships: data.memberships
          ? {
              create: data.memberships,
            }
          : undefined,
      },
      include: {
        paymentRegistrations: {
          include: {
            registration: { include: { member: true } },
          },
        },
        paymentMemberships: {
          include: {
            membership: { include: { member: true } },
          },
        },
      },
    });
  },

  async update(id: number, data: Prisma.PaymentGroupUpdateInput) {
    return prisma.paymentGroup.update({
      where: { id },
      data,
      include: {
        paymentRegistrations: true,
        paymentMemberships: true,
      },
    });
  },

  async markAsCashed(id: number, cashingDate: Date) {
    return prisma.paymentGroup.update({
      where: { id },
      data: {
        cashingDate,
        status: 'cashed',
      },
    });
  },

  async delete(id: number) {
    return prisma.paymentGroup.delete({ where: { id } });
  },
};