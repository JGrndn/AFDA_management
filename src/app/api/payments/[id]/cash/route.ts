import { NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payments';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { cashingDate } = await request.json();
    const { id } = await params;
    const payment = await paymentService.markAsCashed(
      parseInt(id),
      new Date(cashingDate)
    );

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error('Error cashing payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cash payment' },
      { status: 500 }
    );
  }
}