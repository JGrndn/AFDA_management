import { NextResponse } from 'next/server';
import { showService } from '@/lib/services/shows';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const clientId = searchParams.get('clientId');

    const shows = await showService.getAll({
      status,
      clientId: clientId ? parseInt(clientId) : undefined,
    });

    return NextResponse.json(shows);
  } catch (error) {
    console.error('Error fetching shows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shows' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const show = await showService.create({
      clientId: data.clientId,
      title: data.title,
      description: data.description,
      proposedDate: data.proposedDate ? new Date(data.proposedDate) : null,
      confirmedDate: data.confirmedDate ? new Date(data.confirmedDate) : null,
      duration: data.duration,
      proposedPrice: data.proposedPrice,
      agreedPrice: data.agreedPrice,
      location: data.location,
      notes: data.notes,
      status: data.status,
    });

    return NextResponse.json(show, { status: 201 });
  } catch (error: any) {
    console.error('Error creating show:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create show' },
      { status: 500 }
    );
  }
}