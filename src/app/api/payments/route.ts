// src/app/api/payments/route.ts
import { NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payments';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');
    const memberId = searchParams.get('memberId');
    const seasonId = searchParams.get('seasonId');
    const status = searchParams.get('status');
    const uncashedOnly = searchParams.get('uncashedOnly') === 'true';

    let payments;

    if (familyId) {
      payments = await paymentService.getByFamily(
        parseInt(familyId),
        seasonId ? parseInt(seasonId) : undefined
      );
    } else if (memberId) {
      payments = await paymentService.getByMember(
        parseInt(memberId),
        seasonId ? parseInt(seasonId) : undefined
      );
    } else {
      payments = await paymentService.getAll({
        seasonId: seasonId ? parseInt(seasonId) : undefined,
        status: status || undefined,
        uncashedOnly,
      });
    }

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const payment = await paymentService.create({
      familyId: data.familyId || undefined,
      memberId: data.memberId || undefined,
      seasonId: data.seasonId,
      amount: data.amount,
      paymentType: data.paymentType,
      paymentDate: new Date(data.paymentDate),
      reference: data.reference,
      notes: data.notes,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}