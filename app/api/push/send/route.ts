import { NextRequest, NextResponse } from 'next/server';
import {
  sendPushNotificationToUser,
  sendPushNotificationToAdminsAndCoaches,
  PushPayload,
} from '@/lib/webpush';

export async function POST(request: NextRequest) {
  try {
    const {
      target, // 'user' | 'admins_and_coaches' | 'coach'
      userId,
      coachId,
      payload,
    } = (await request.json()) as {
      target: 'user' | 'admins_and_coaches' | 'coach';
      userId?: string;
      coachId?: string;
      payload: PushPayload;
    };

    if (!payload || !payload.title || !payload.body) {
      return NextResponse.json({ error: 'Payload with title and body is required' }, { status: 400 });
    }

    if (target === 'user' && userId) {
      const res = await sendPushNotificationToUser(userId, payload);
      return NextResponse.json({ success: true, result: res });
    }

    if (target === 'coach' && coachId) {
      const res = await sendPushNotificationToUser(coachId, payload);
      return NextResponse.json({ success: true, result: res });
    }

    if (target === 'admins_and_coaches') {
      const res = await sendPushNotificationToAdminsAndCoaches(payload);
      return NextResponse.json({ success: true, result: res });
    }

    return NextResponse.json({ error: 'Invalid target or missing IDs' }, { status: 400 });
  } catch (err: any) {
    console.error('Error in send push API route:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
