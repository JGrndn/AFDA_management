import { NextResponse } from 'next/server';
import { seasonService } from '@/lib/services/seasons';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const season = await seasonService.getById(parseInt(params.id));
    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }
    return NextResponse.json(season);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch season' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const season = await seasonService.update(parseInt(params.id), data);
    return NextResponse.json(season);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update season' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await seasonService.delete(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete season' }, { status: 500 });
  }
}