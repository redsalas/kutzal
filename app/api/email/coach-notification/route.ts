import { NextRequest, NextResponse } from 'next/server';
import { sendCoachNotificationEmail, CoachNotificationType, CoachNotificationDetails } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { coachEmail, type, details } = (await request.json()) as {
      coachEmail?: string;
      type?: CoachNotificationType;
      details?: CoachNotificationDetails;
    };

    if (!coachEmail || !type) {
      return NextResponse.json(
        { error: 'coachEmail and type are required' },
        { status: 400 }
      );
    }

    const result = await sendCoachNotificationEmail(coachEmail, type, details || {});

    if (result.success) {
      return NextResponse.json(
        { message: 'Coach notification email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send coach email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in coach notification email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
