import { NextResponse } from 'next/server';
import { workshopService } from '@/lib/services/workshops';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const seasonId = searchParams.get('seasonId');
    
    let workshops;
    if (seasonId) {
      workshops = await workshopService.getBySeasonId(parseInt(seasonId));
    } else {
      workshops = await workshopService.getAll(activeOnly);
    }
    
    return NextResponse.json(workshops);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch workshops' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const workshop = await workshopService.create(data);
    return NextResponse.json(workshop, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create workshop' }, { status: 500 });
  }
}