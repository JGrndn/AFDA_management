import { NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payments';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const uncashedOnly = searchParams.get('uncashedOnly') === 'true';
    
    const payments = await paymentService.getAll({
      status,
      uncashedOnly,
    });
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const payment = await paymentService.create(data);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}