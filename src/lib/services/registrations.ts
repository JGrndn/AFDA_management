import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export const registrationService = {
  async getAll(seasonId?: number) {
    return prisma.registration.findMany({
      where: seasonId ? { seasonId } : undefined,
      include: {
        member: { include: { family: true } },
        season: true,
        workshopRegistrations: { include: { workshop: true } },
      },
      orderBy: { registrationDate: 'desc' },
    });
  },

  async getById(id: number) {
    return prisma.registration.findUnique({
      where: { id },
      include: {
        member: { include: { family: true } },
        season: true,
        workshopRegistrations: { include: { workshop: true } },
      },
    });
  },

  async create(
    memberId: number,
    seasonId: number,
    workshopIds: number[],
    familyOrder: number = 1
  ) {
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: { workshopPrices: true },
    });

    if (!season) throw new Error('Season not found');

    const discountPercent = familyOrder > 1 ? 10 : 0;

    const registration = await prisma.registration.create({
      data: {
        memberId,
        seasonId,
        familyOrder,
        status: 'pending',
        workshopRegistrations: {
          create: workshopIds.map((workshopId) => {
            const price = season.workshopPrices.find(
              (p) => p.workshopId === workshopId
            );
            if (!price) throw new Error(`No price found for workshop ${workshopId}`);

            const basePrice = Number(price.amount);
            const appliedPrice = basePrice * (1 - discountPercent / 100);

            return {
              workshopId,
              appliedPrice,
              discountPercent,
            };
          }),
        },
      },
      include: {
        workshopRegistrations: { include: { workshop: true } },
        member: true,
        season: true,
      },
    });

    return registration;
  },

  async update(id: number, data: Prisma.RegistrationUpdateInput) {
    return prisma.registration.update({
      where: { id },
      data,
      include: {
        workshopRegistrations: { include: { workshop: true } },
      },
    });
  },

  async delete(id: number) {
    return prisma.registration.delete({ where: { id } });
  },

  async getTotalAmount(registrationId: number) {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        workshopRegistrations: true,
        season: true,
      },
    });

    if (!registration) return 0;

    const workshopTotal = registration.workshopRegistrations.reduce(
      (sum, wr) => sum + Number(wr.appliedPrice),
      0
    );

    const membershipAmount = Number(registration.season.membershipAmount);

    return workshopTotal + membershipAmount;
  },

  async updateWorkshops(
    registrationId: number,
    workshopIds: number[],
    familyOrder?: number
  ) {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        workshopRegistrations: true,
        season: { include: { workshopPrices: true } },
      },
    });

    if (!registration) throw new Error('Registration not found');

    const discountPercent = (familyOrder || registration.familyOrder) > 1 ? 10 : 0;

    // Supprimer les anciennes inscriptions aux ateliers
    await prisma.workshopRegistration.deleteMany({
      where: { registrationId },
    });

    // Créer les nouvelles
    await Promise.all(
      workshopIds.map(async (workshopId) => {
        const price = registration.season.workshopPrices.find(
          (p) => p.workshopId === workshopId
        );
        if (!price) throw new Error(`No price found for workshop ${workshopId}`);

        const basePrice = Number(price.amount);
        const appliedPrice = basePrice * (1 - discountPercent / 100);

        return prisma.workshopRegistration.create({
          data: {
            registrationId,
            workshopId,
            appliedPrice,
            discountPercent,
          },
          include: { workshop: true },
        });
      })
    );

    // Mettre à jour le familyOrder si fourni
    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: familyOrder !== undefined ? { familyOrder } : {},
      include: {
        workshopRegistrations: { include: { workshop: true } },
        member: true,
        season: true,
      },
    });

    return updatedRegistration;
  }
};