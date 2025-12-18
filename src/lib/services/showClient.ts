import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export const showClientService = {
  async getAll() {
    return prisma.showClient.findMany({
      include: {
        _count: {
          select: {
            shows: true,
            payments: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  },

  async getById(id: number) {
    return prisma.showClient.findUnique({
      where: { id },
      include: {
        shows: {
          orderBy: { proposedDate: 'desc' },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });
  },

  async create(data: {
    type: string;
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
  }) {
    return prisma.showClient.create({
      data,
    });
  },

  async update(id: number, data: Prisma.ShowClientUpdateInput) {
    return prisma.showClient.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return prisma.showClient.delete({ where: { id } });
  },
};