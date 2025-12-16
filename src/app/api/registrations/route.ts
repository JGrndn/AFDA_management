import { NextResponse } from 'next/server';
import { registrationService } from '@/lib/services/registrations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get('seasonId');
    const registrations = await registrationService.getAll(
      seasonId ? parseInt(seasonId) : undefined
    );
    return NextResponse.json(registrations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { memberId, seasonId, workshopQuantities, familyOrder } = await request.json();
    
    const registration = await registrationService.create(
      memberId,
      seasonId,
      workshopQuantities, // Maintenant avec quantity
      familyOrder
    );
    
    return NextResponse.json(registration, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create registration' }, 
      { status: 500 }
    );
  }
}