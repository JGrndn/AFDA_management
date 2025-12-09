import { NextResponse } from 'next/server';
import { familyService } from '@/lib/services/families';

export async function GET() {
  try {
    const families = await familyService.getAll();
    return NextResponse.json(families);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch families' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const family = await familyService.create(data);
    return NextResponse.json(family, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create family' }, { status: 500 });
  }
}