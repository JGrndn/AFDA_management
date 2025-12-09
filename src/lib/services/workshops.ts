import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export const workshopService = {
  async getAll(activeOnly = false) {
    return prisma.workshop.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        workshopPrices: { include: { season: true } },
        _count: { select: { workshopRegistrations: true } },
      },
      orderBy: { name: 'asc' },
    });
  },

  async getById(id: number) {
    return prisma.workshop.findUnique({
      where: { id },
      include: {
        workshopPrices: { include: { season: true } },
        workshopRegistrations: {
          include: {
            registration: { include: { member: true } },
          },
        },
      },
    });
  },

  async getBySeasonId(seasonId: number) {
    return prisma.workshop.findMany({
      where: {
        isActive: true,
        workshopPrices: { some: { seasonId } },
      },
      include: {
        workshopPrices: { where: { seasonId } },
      },
      orderBy: { name: 'asc' },
    });
  },

  async create(data: Prisma.WorkshopCreateInput) {
    return prisma.workshop.create({ data });
  },

  async update(id: number, data: Prisma.WorkshopUpdateInput) {
    return prisma.workshop.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.workshop.delete({ where: { id } });
  },

  async setPriceForSeason(workshopId: number, seasonId: number, amount: number) {
    return prisma.workshopPrice.upsert({
      where: {
        workshopId_seasonId: { workshopId, seasonId },
      },
      create: { workshopId, seasonId, amount },
      update: { amount },
    });
  },
};