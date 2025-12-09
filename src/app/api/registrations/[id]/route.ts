import { NextResponse } from 'next/server';
import { registrationService } from '@/lib/services/registrations';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const registration = await registrationService.getById(parseInt(params.id));
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    return NextResponse.json(registration);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch registration' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const registration = await registrationService.update(parseInt(params.id), data);
    return NextResponse.json(registration);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await registrationService.delete(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 });
  }
}