// src/app/api/payments/route.ts
import { NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payments';
import { PaymentStatusSchema, PaymentTypeSchema } from '@/lib/schemas/enums';
import z from 'zod';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');
    const memberId = searchParams.get('memberId');
    const seasonId = searchParams.get('seasonId');
    const showClientId = searchParams.get('showClientId');
    const statusParam = searchParams.get('status');
    const uncashedOnly = searchParams.get('uncashedOnly') === 'true';
    const showOnly = searchParams.get('showOnly') === 'true';

    let status = undefined;
    if (statusParam) {
      const result = PaymentStatusSchema.safeParse(statusParam);
      if (!result.success) {
        return NextResponse.json(
          { error: 'Invalid payment status value', valid: PaymentStatusSchema.options },
          { status: 400 }
        );
      }
      status = result.data;
    }

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
    } else if (showClientId) {
      payments = await paymentService.getByShowClient(parseInt(showClientId));
    } else {
      payments = await paymentService.getAll({
        seasonId: seasonId ? parseInt(seasonId) : undefined,
        status: status || undefined,
        uncashedOnly,
        showOnly
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
    const paymentType = PaymentTypeSchema.parse(data.paymentType);

    const payment = await paymentService.create({
      familyId: data.familyId || undefined,
      memberId: data.memberId || undefined,
      seasonId: data.seasonId,
      amount: data.amount,
      paymentType: paymentType,
      paymentDate: new Date(data.paymentDate),
      reference: data.reference,
      notes: data.notes,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}