import { NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payments';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');
    const memberId = searchParams.get('memberId');
    const seasonId = searchParams.get('seasonId');

    const status = await paymentService.getPaymentStatus(
      familyId ? parseInt(familyId) : null,
      memberId ? parseInt(memberId) : null,
      seasonId ? parseInt(seasonId) : undefined
    );

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
}