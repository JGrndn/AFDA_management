import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export const familyService = {
  async getAll() {
    return prisma.family.findMany({
      include: {
        members: true,
        _count: { select: { members: true } },
      },
      orderBy: { name: 'asc' },
    });
  },

  async getById(id: number) {
    return prisma.family.findUnique({
      where: { id },
      include: { members: true },
    });
  },

  async create(data: Prisma.FamilyCreateInput) {
    return prisma.family.create({
      data,
      include: { members: true },
    });
  },

  async update(id: number, data: Prisma.FamilyUpdateInput) {
    return prisma.family.update({
      where: { id },
      data,
      include: { members: true },
    });
  },

  async delete(id: number) {
    return prisma.family.delete({ where: { id } });
  },
};