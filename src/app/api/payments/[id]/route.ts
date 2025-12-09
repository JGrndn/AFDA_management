import { NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payments';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await paymentService.getById(parseInt(params.id));
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const payment = await paymentService.update(parseInt(params.id), data);
    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}