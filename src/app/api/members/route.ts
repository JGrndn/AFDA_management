import { NextResponse } from 'next/server';
import { memberService } from '@/lib/services/members';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const members = await memberService.getAll(search);
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const member = await memberService.create(data);
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}