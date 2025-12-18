import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export const showService = {
  async getAll(filters?: { status?: string; clientId?: number }) {
    return prisma.show.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.clientId && { clientId: filters.clientId }),
      },
      include: {
        client: true,
      },
      orderBy: [
        { status: 'asc' },
        { proposedDate: 'desc' },
      ],
    });
  },

  async getById(id: number) {
    return prisma.show.findUnique({
      where: { id },
      include: {
        client: true,
      },
    });
  },

  async create(data: {
    clientId: number;
    title: string;
    description?: string;
    proposedDate?: Date | null;
    confirmedDate?: Date | null;
    duration?: number | null;
    proposedPrice: number;
    agreedPrice?: number | null;
    location?: string;
    notes?: string;
    status?: string;
  }) {
    return prisma.show.create({
      data: {
        clientId: data.clientId,
        title: data.title,
        description: data.description,
        proposedDate: data.proposedDate,
        duration: data.duration,
        proposedPrice: data.proposedPrice,
        notes: data.notes,
        status: data.status || 'pending',
      },
      include: {
        client: true,
      },
    });
  },

  async update(id: number, data: Prisma.ShowUpdateInput) {
    return prisma.show.update({
      where: { id },
      data,
      include: {
        client: true,
      },
    });
  },

  async delete(id: number) {
    return prisma.show.delete({ where: { id } });
  },

  async getUpcoming() {
    return prisma.show.findMany({
      where: {
        status: 'confirmed',
        OR: [
          { proposedDate: { gte: new Date() } },
        ],
      },
      include: {
        client: true,
      },
      orderBy: [
        { proposedDate: 'asc' },
      ],
    });
  },
};