import { NextRequest, NextResponse } from 'next/server';
import { sendPlanPurchaseEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, planName, planDetails } = await request.json();

    if (!email || !planName) {
      return NextResponse.json(
        { error: 'Email and plan name are required' },
        { status: 400 }
      );
    }

    const result = await sendPlanPurchaseEmail(email, planName, planDetails || {});

    if (result.success) {
      return NextResponse.json(
        { message: 'Plan purchase email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in plan purchase email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


