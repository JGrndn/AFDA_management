import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import type { MembershipStatus, PaymentStatus, PaymentType } from '@/lib/schemas/enums';

export const paymentService = {
  async getAll(filters?: { seasonId?: number; status?: PaymentStatus; uncashedOnly?: boolean; showOnly?: boolean; }) {
    return prisma.payment.findMany({
      where: {
        ...(filters?.seasonId && { seasonId: filters.seasonId }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.uncashedOnly && {
          cashingDate: null,
          paymentType: 'check' as PaymentType,
        }),
        ...(filters?.showOnly && {
          showClientId: { not: null },
        }),
      },
      include: {
        family: { include: { members: true } },
        member: true,
        season: true,
        showClient: true
      },
      orderBy: { paymentDate: 'desc' },
    });
  },

  async getById(id: number) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        family: { include: { members: true } },
        member: true,
        season: true,
      },
    });
  },

  async getByFamily(familyId: number, seasonId?: number) {
    return prisma.payment.findMany({
      where: {
        familyId,
        ...(seasonId && { seasonId }),
      },
      include: { season: true },
      orderBy: { paymentDate: 'desc' },
    });
  },

  async getByMember(memberId: number, seasonId?: number) {
    return prisma.payment.findMany({
      where: {
        memberId,
        ...(seasonId && { seasonId }),
      },
      include: { season: true },
      orderBy: { paymentDate: 'desc' },
    });
  },

  async getByShowClient(showClientId: number) {
    return prisma.payment.findMany({
      where: { showClientId },
      include: {
        showClient: true,
        season: true,
      },
      orderBy: { paymentDate: 'desc' },
    });
  },

  async create(data: {
    familyId?: number;
    memberId?: number;
    seasonId?: number;
    showClientId?: number;
    amount: number;
    paymentType: PaymentType;
    paymentDate: Date;
    reference?: string;
    notes?: string;
  }) {
    if (!data.showClientId && !data.seasonId) {
      throw new Error('seasonId is required for non-show payments');
    }

    const payment = await prisma.payment.create({
      data: {
        familyId: data.familyId,
        memberId: data.memberId,
        seasonId: data.seasonId,
        showClientId: data.showClientId,
        amount: data.amount,
        paymentType: data.paymentType,
        paymentDate: data.paymentDate,
        reference: data.reference,
        notes: data.notes,
        status: 'pending' as PaymentStatus,
      },
      include: {
        family: true,
        member: true,
        season: true,
        showClient: true,
      },
    });

    if (data.seasonId){
      // Calculer les dons si paiement > total dû
      const totalDue = await this.calculateTotalDue(data.familyId, data.memberId, data.seasonId);
      const totalPaid = await this.calculateTotalPaid(data.familyId, data.memberId, data.seasonId);
      const donation = Math.max(0, (totalPaid + data.amount) - totalDue);

      // Mettre à jour les dons de la saison si applicable
      if (donation > 0) {
        await prisma.season.update({
          where: { id: data.seasonId },
          data: {
            totalDonations: { increment: donation },
          },
        });
      }

      // Mettre à jour le statut des adhésions si nécessaire
      await this.updateMembershipStatuses(data.familyId, data.memberId, data.seasonId);
    }

    return payment;
  },

  async update(id: number, data: Prisma.PaymentUpdateInput) {
    return prisma.payment.update({
      where: { id },
      data,
      include: {
        family: true,
        member: true,
        season: true,
      },
    });
  },

  async markAsCashed(id: number, cashingDate: Date) {
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        cashingDate,
        status: 'cashed' as PaymentStatus,
      },
      include: { family: true, member: true, season: true },
    });

    // Mettre à jour le statut des adhésions
    await this.updateMembershipStatuses(
      payment.familyId,
      payment.memberId,
      payment.seasonId
    );

    return payment;
  },

  async delete(id: number) {
    return prisma.payment.delete({ where: { id } });
  },

  // Calculer le total dû pour une famille ou un membre
  async calculateTotalDue(familyId?: number | null, memberId?: number | null, seasonId?: number) {
    let memberIds: number[] = [];

    if (familyId) {
      const family = await prisma.family.findUnique({
        where: { id: familyId },
        include: { members: true },
      });
      memberIds = family?.members.map(m => m.id) || [];
    } else if (memberId) {
      memberIds = [memberId];
    }

    if (memberIds.length === 0) return 0;

    // Total des adhésions
    const memberships = await prisma.membership.findMany({
      where: {
        memberId: { in: memberIds },
        ...(seasonId && { seasonId }),
      },
    });

    const membershipTotal = memberships.reduce(
      (sum, m) => sum + Number(m.amount),
      0
    );

    // Total des ateliers
    const registrations = await prisma.registration.findMany({
      where: {
        memberId: { in: memberIds },
        ...(seasonId && { seasonId }),
      },
      include: {
        workshopRegistrations: true,
      },
    });

    const workshopTotal = registrations.reduce(
      (sum, reg) => sum + reg.workshopRegistrations.reduce(
        (s, wr) => s + Number(wr.appliedPrice),
        0
      ),
      0
    );

    return membershipTotal + workshopTotal;
  },

  // Calculer le total payé (encaissé uniquement)
  async calculateTotalPaid(familyId?: number | null, memberId?: number | null, seasonId?: number) {
    const payments = await prisma.payment.findMany({
      where: {
        ...(familyId && { familyId }),
        ...(memberId && { memberId }),
        ...(seasonId && { seasonId }),
        status: 'cashed' as PaymentStatus,
      },
    });

    return payments.reduce((sum, p) => sum + Number(p.amount), 0);
  },

  // Mettre à jour le statut des adhésions en fonction des paiements
  async updateMembershipStatuses(familyId?: number | null, memberId?: number | null, seasonId?: number) {
    let memberIds: number[] = [];

    if (familyId) {
      const family = await prisma.family.findUnique({
        where: { id: familyId },
        include: { members: true },
      });
      memberIds = family?.members.map(m => m.id) || [];
    } else if (memberId) {
      memberIds = [memberId];
    }

    if (memberIds.length === 0) return;

    const totalDue = await this.calculateTotalDue(familyId, memberId, seasonId);
    const totalPaid = await this.calculateTotalPaid(familyId, memberId, seasonId);

    const newStatus = totalPaid >= totalDue ? 'validated' : 'pending';

    // Mettre à jour toutes les adhésions concernées
    await prisma.membership.updateMany({
      where: {
        memberId: { in: memberIds },
        ...(seasonId && { seasonId }),
      },
      data: {
        status: newStatus as MembershipStatus,
      },
    });
  },

  // Obtenir le statut de paiement pour une famille/membre
  async getPaymentStatus(familyId?: number | null, memberId?: number | null, seasonId?: number) {
    const totalDue = await this.calculateTotalDue(familyId, memberId, seasonId);
    const totalPaid = await this.calculateTotalPaid(familyId, memberId, seasonId);
    const balance = totalDue - totalPaid;
    const donation = Math.max(0, totalPaid - totalDue);

    return {
      totalDue,
      totalPaid,
      balance,
      donation,
      isFullyPaid: totalPaid >= totalDue,
      status: totalPaid >= totalDue ? 'validated' : totalPaid > 0 ? 'partial' : 'unpaid',
    };
  },
};