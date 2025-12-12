import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const seasonId = searchParams.get('seasonId');

    const where: any = {};
    if (memberId) where.memberId = parseInt(memberId);
    if (seasonId) where.seasonId = parseInt(seasonId);

    const memberships = await prisma.membership.findMany({
      where,
      include: {
        member: true,
        season: true,
      },
      orderBy: { membershipDate: 'desc' },
    });

    return NextResponse.json(memberships);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch memberships' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const membership = await prisma.membership.create({
      data: {
        memberId: data.memberId,
        seasonId: data.seasonId,
        amount: data.amount,
        status: data.status || 'pending',
        membershipDate: data.membershipDate ? new Date(data.membershipDate) : new Date(),
      },
      include: {
        member: true,
        season: true,
      },
    });

    return NextResponse.json(membership, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create membership' },
      { status: 500 }
    );
  }
}