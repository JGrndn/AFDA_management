// src/app/api/registrations/[id]/workshops/route.ts
import { NextResponse } from 'next/server';
import { registrationService } from '@/lib/services/registrations';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { workshopIds, familyOrder } = await request.json();
    const { id } = await params;
    const registration = await registrationService.updateWorkshops(
      parseInt(id),
      workshopIds,
      familyOrder
    );
    
    return NextResponse.json(registration);
  } catch (error: any) {
    console.error('Error updating workshops:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update workshops' },
      { status: 500 }
    );
  }
}