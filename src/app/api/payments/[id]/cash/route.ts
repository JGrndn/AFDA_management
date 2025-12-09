import { NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payments';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { cashingDate } = await request.json();
    const payment = await paymentService.markAsCashed(
      parseInt(params.id),
      new Date(cashingDate)
    );
    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cash payment' }, { status: 500 });
  }
}