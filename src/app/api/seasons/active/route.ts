import { NextResponse } from 'next/server';
import { seasonService } from '@/lib/services/seasons';

export async function GET() {
  try {
    const season = await seasonService.getActive();
    return NextResponse.json(season);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch active season' }, { status: 500 });
  }
}