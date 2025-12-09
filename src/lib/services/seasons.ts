import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export const seasonService = {
  async getAll() {
    return prisma.season.findMany({
      include: {
        workshopPrices: { include: { workshop: true } },
        _count: { select: { registrations: true, memberships: true } },
      },
      orderBy: { startYear: 'desc' },
    });
  },

  async getById(id: number) {
    return prisma.season.findUnique({
      where: { id },
      include: {
        workshopPrices: { include: { workshop: true } },
        registrations: { include: { member: true } },
        memberships: { include: { member: true } },
      },
    });
  },

  async getActive() {
    return prisma.season.findFirst({
      where: { isActive: true },
      include: {
        workshopPrices: { include: { workshop: true } },
      },
    });
  },

  async create(data: Prisma.SeasonCreateInput) {
    return prisma.season.create({ data });
  },

  async update(id: number, data: Prisma.SeasonUpdateInput) {
    return prisma.season.update({ where: { id }, data });
  },

  async setActive(id: number) {
    await prisma.season.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
    return prisma.season.update({
      where: { id },
      data: { isActive: true },
    });
  },

  async delete(id: number) {
    return prisma.season.delete({ where: { id } });
  },
};