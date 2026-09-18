// Web Push utility for sending notifications via VAPID and Web Push protocol
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || '';

const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || 'mailto:info@kutzal.mx';

if (NEXT_PUBLIC_VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      VAPID_SUBJECT,
      NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
  } catch (err) {
    console.error('Error setting VAPID details:', err);
  }
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, serviceRoleKey);
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  data?: Record<string, unknown>;
}

/**
 * Send push notification to all devices registered for a specific user ID
 */
export async function sendPushNotificationToUser(userId: string, payload: PushPayload) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: subs, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', userId);

    if (error || !subs || subs.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const stringPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/images/logo.webp',
      badge: payload.badge || '/images/logo.webp',
      url: payload.url || '/dashboard',
      data: payload.data || {},
    });

    let sent = 0;
    let failed = 0;
    const expiredIds: string[] = [];

    await Promise.all(
      subs.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, stringPayload);
          sent++;
        } catch (pushErr: any) {
          failed++;
          // 404 or 410 means subscription is expired / unsubscribed
          if (pushErr.statusCode === 404 || pushErr.statusCode === 410) {
            expiredIds.push(sub.id);
          }
        }
      })
    );

    // Clean up expired subscriptions
    if (expiredIds.length > 0) {
      await supabaseAdmin.from('push_subscriptions').delete().in('id', expiredIds);
    }

    return { sent, failed };
  } catch (error) {
    console.error(`Error sending push notification to user ${userId}:`, error);
    return { sent: 0, failed: 0, error };
  }
}

/**
 * Send push notification to all registered admins and coaches
 */
export async function sendPushNotificationToAdminsAndCoaches(payload: PushPayload) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    // Get IDs of users with role admin or coach
    const { data: staff, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'coach']);

    if (error || !staff || staff.length === 0) return { sent: 0 };

    let totalSent = 0;
    for (const member of staff) {
      const res = await sendPushNotificationToUser(member.id, payload);
      totalSent += res.sent;
    }
    return { sent: totalSent };
  } catch (err) {
    console.error('Error sending push to admins/coaches:', err);
    return { sent: 0 };
  }
}
