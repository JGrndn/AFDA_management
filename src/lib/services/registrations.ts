import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

interface WorkshopQuantity {
  workshopId: number;
  quantity: number;
}

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
    workshopQuantities: WorkshopQuantity[], // Modifié pour accepter quantity
    familyOrder: number = 1
  ) {
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: { workshopPrices: true },
    });

    if (!season) throw new Error('Season not found');

    // Récupérer les workshops pour vérifier allowMultiple et maxPerMember
    const workshopIds = workshopQuantities.map(wq => wq.workshopId);
    const workshops = await prisma.workshop.findMany({
      where: { id: { in: workshopIds } }
    });

    // Valider les quantités
    for (const wq of workshopQuantities) {
      const workshop = workshops.find(w => w.id === wq.workshopId);
      if (!workshop) throw new Error(`Workshop ${wq.workshopId} not found`);
      
      if (wq.quantity > 1 && !workshop.allowMultiple) {
        throw new Error(`Workshop "${workshop.name}" does not allow multiple registrations`);
      }
      
      if (workshop.maxPerMember && wq.quantity > workshop.maxPerMember) {
        throw new Error(`Workshop "${workshop.name}" allows maximum ${workshop.maxPerMember} registrations per member`);
      }
    }

    // Vérifier si le membre a une adhésion
    const membership = await prisma.membership.findFirst({
      where: { 
        memberId, 
        seasonId,
        status: { in: ['pending', 'validated'] }
      }
    });

    const eligibleForDiscount = familyOrder > 1 && !!membership;
    const discountPercent = eligibleForDiscount ? season.discountPercent : 0;

    const registration = await prisma.registration.create({
      data: {
        memberId,
        seasonId,
        familyOrder,
        workshopRegistrations: {
          create: workshopQuantities.map((wq) => {
            const price = season.workshopPrices.find(
              (p) => p.workshopId === wq.workshopId
            );
            if (!price) throw new Error(`No price found for workshop ${wq.workshopId}`);

            const basePrice = Number(price.amount);
            const appliedPrice = basePrice * (1 - discountPercent / 100);

            return {
              workshopId: wq.workshopId,
              quantity: wq.quantity,
              appliedPrice, // Prix unitaire
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

    // Calculer le total en tenant compte de la quantité
    const workshopTotal = registration.workshopRegistrations.reduce(
      (sum, wr) => sum + (Number(wr.appliedPrice) * wr.quantity),
      0
    );

    const membershipAmount = Number(registration.season.membershipAmount);

    return workshopTotal + membershipAmount;
  },

  async updateWorkshops(
    registrationId: number,
    workshopQuantities: WorkshopQuantity[], // Modifié
    familyOrder?: number
  ) {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        workshopRegistrations: true,
        season: { include: { workshopPrices: true } },
        member: true,
      },
    });

    if (!registration) throw new Error('Registration not found');

    // Récupérer les workshops pour validation
    const workshopIds = workshopQuantities.map(wq => wq.workshopId);
    const workshops = await prisma.workshop.findMany({
      where: { id: { in: workshopIds } }
    });

    // Valider les quantités
    for (const wq of workshopQuantities) {
      const workshop = workshops.find(w => w.id === wq.workshopId);
      if (!workshop) throw new Error(`Workshop ${wq.workshopId} not found`);
      
      if (wq.quantity > 1 && !workshop.allowMultiple) {
        throw new Error(`Workshop "${workshop.name}" does not allow multiple registrations`);
      }
      
      if (workshop.maxPerMember && wq.quantity > workshop.maxPerMember) {
        throw new Error(`Workshop "${workshop.name}" allows maximum ${workshop.maxPerMember} registrations per member`);
      }
    }

    // Vérifier si le membre a une adhésion
    const membership = await prisma.membership.findFirst({
      where: { 
        memberId: registration.memberId, 
        seasonId: registration.seasonId,
        status: { in: ['pending', 'validated'] }
      }
    });

    const currentFamilyOrder = familyOrder !== undefined ? familyOrder : registration.familyOrder;
    const eligibleForDiscount = currentFamilyOrder > 1 && !!membership;
    const discountPercent = eligibleForDiscount ? registration.season.discountPercent : 0;

    // Supprimer les anciennes inscriptions
    await prisma.workshopRegistration.deleteMany({
      where: { registrationId },
    });

    // Créer les nouvelles avec quantité
    await Promise.all(
      workshopQuantities.map(async (wq) => {
        const price = registration.season.workshopPrices.find(
          (p) => p.workshopId === wq.workshopId
        );
        if (!price) throw new Error(`No price found for workshop ${wq.workshopId}`);

        const basePrice = Number(price.amount);
        const appliedPrice = basePrice * (1 - discountPercent / 100);

        return prisma.workshopRegistration.create({
          data: {
            registrationId,
            workshopId: wq.workshopId,
            quantity: wq.quantity,
            appliedPrice, // Prix unitaire
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
  },

  async recalculateWorkshopPricesForMember(memberId: number, seasonId: number) {
    const registration = await prisma.registration.findUnique({
      where: { 
        memberId_seasonId: { memberId, seasonId } 
      },
      include: { 
        workshopRegistrations: true,
        season: { include: { workshopPrices: true } }
      }
    });

    if (!registration) return;

    const membership = await prisma.membership.findFirst({
      where: { 
        memberId, 
        seasonId,
        status: { in: ['pending', 'validated'] }
      }
    });

    const eligibleForDiscount = registration.familyOrder > 1 && !!membership;
    const discountPercent = eligibleForDiscount ? registration.season.discountPercent : 0;

    // Mettre à jour chaque workshop registration (prix unitaire)
    for (const wr of registration.workshopRegistrations) {
      const price = registration.season.workshopPrices.find(
        p => p.workshopId === wr.workshopId
      );
      
      if (price) {
        const basePrice = Number(price.amount);
        const newAppliedPrice = basePrice * (1 - discountPercent / 100);
        
        await prisma.workshopRegistration.update({
          where: { id: wr.id },
          data: {
            appliedPrice: newAppliedPrice, // Prix unitaire
            discountPercent: discountPercent
          }
        });
      }
    }

    return registration;
  }
};