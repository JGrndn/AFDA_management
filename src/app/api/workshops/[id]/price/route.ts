import { NextResponse } from 'next/server';
import { workshopService } from '@/lib/services/workshops';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { seasonId, amount } = await request.json();
    const price = await workshopService.setPriceForSeason(
      parseInt(id),
      seasonId,
      amount
    );
    return NextResponse.json(price);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to set price' },
      { status: 500 }
    );
  }
}