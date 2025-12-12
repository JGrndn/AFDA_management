import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const membership = await prisma.membership.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        member: true,
        season: true,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
    }

    return NextResponse.json(membership);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch membership' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    const membership = await prisma.membership.update({
      where: { id: parseInt(params.id) },
      data: {
        amount: data.amount,
        status: data.status,
        membershipDate: data.membershipDate ? new Date(data.membershipDate) : undefined,
      },
      include: {
        member: true,
        season: true,
      },
    });

    return NextResponse.json(membership);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update membership' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.membership.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete membership' }, { status: 500 });
  }
}