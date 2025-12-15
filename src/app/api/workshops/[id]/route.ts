import { NextResponse } from 'next/server';
import { workshopService } from '@/lib/services/workshops';


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workshop = await workshopService.getById(parseInt(id));
    if (!workshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }
    return NextResponse.json(workshop);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch workshop' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const workshop = await workshopService.update(parseInt(id), data);
    return NextResponse.json(workshop);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update workshop' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await workshopService.delete(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete workshop' }, { status: 500 });
  }
}