import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { extractScalarFields } from '@/lib/utils';

export const memberService = {
  async getAll(search?: string) {
    return prisma.member.findMany({
      where: search ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      } : undefined,
      include: {
        family: true,
        _count: { select: { registrations: true, memberships: true } },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  },

  async getById(id: number) {
    return prisma.member.findUnique({
      where: { id },
      include: {
        family: true,
        registrations: {
          include: {
            season: true,
            workshopRegistrations: { include: { workshop: true } },
          },
        },
        memberships: {
          include: {
            season: true,
          },
        },
      },
    });
  },

  async create(data: Prisma.MemberCreateInput) {
    return prisma.member.create({
      data,
      include: { family: true },
    });
  },

  async update(id: number, data: Prisma.MemberUpdateInput) {
    const cleanData = extractScalarFields(data) as Prisma.MemberUpdateInput;
    return prisma.member.update({
      where: { id },
      data: cleanData,
      include: { family: true },
    });
  },

  async delete(id: number) {
    return prisma.member.delete({ where: { id } });
  },
};