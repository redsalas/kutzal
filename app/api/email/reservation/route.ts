import { NextRequest, NextResponse } from 'next/server';
import { sendReservationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, reservationDetails } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await sendReservationEmail(email, reservationDetails || {});

    if (result.success) {
      return NextResponse.json(
        { message: 'Reservation email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in reservation email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


