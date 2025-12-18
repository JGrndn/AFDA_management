import { NextResponse } from 'next/server';
import { showService } from '@/lib/services/shows';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const show = await showService.getById(parseInt(id));

    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    return NextResponse.json(show);
  } catch (error) {
    console.error('Error fetching show:', error);
    return NextResponse.json(
      { error: 'Failed to fetch show' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updateData: any = { ...data };
    if (data.proposedDate) updateData.proposedDate = new Date(data.proposedDate);
    if (data.confirmedDate) updateData.confirmedDate = new Date(data.confirmedDate);
    if (data.responseDate) updateData.responseDate = new Date(data.responseDate);

    const show = await showService.update(parseInt(id), updateData);

    return NextResponse.json(show);
  } catch (error: any) {
    console.error('Error updating show:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update show' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await showService.delete(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting show:', error);
    return NextResponse.json(
      { error: 'Failed to delete show' },
      { status: 500 }
    );
  }
}