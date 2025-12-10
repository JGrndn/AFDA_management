import { NextResponse } from 'next/server';
import { familyService } from '@/lib/services/families';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const family = await familyService.getById(parseInt(params.id));
    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }
    return NextResponse.json(family);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch family' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const family = await familyService.update(parseInt(params.id), data);
    return NextResponse.json(family);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update family' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await familyService.delete(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete family' }, { status: 500 });
  }
}