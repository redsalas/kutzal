import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { sendPackagePurchaseEmail } from '@/lib/email';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Disable body parsing so we can read the raw body for signature verification
export const config = {
  api: { bodyParser: false },
};

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set.');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only fulfill paid sessions
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true });
    }

    const { userId, packageName, totalClasses, totalCost } = session.metadata ?? {};

    if (!userId || !packageName || !totalClasses || !totalCost) {
      console.error('Missing metadata in checkout session:', session.id);
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const classes = parseInt(totalClasses, 10);
    const cost = parseInt(totalCost, 10);

    // Calculate expiry: 1 calendar month from now
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { error: insertError } = await supabaseAdmin
      .from('class_packages')
      .insert({
        user_id: userId,
        package_name: packageName,
        total_classes: classes,
        remaining_classes: classes,
        total_cost: cost,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        status: 'active',
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error inserting class package:', insertError);
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 });
    }

    console.log(`Package created for user ${userId}: ${packageName}`);

    // Send package purchase confirmation email
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      const emailTo = profile?.email || session.customer_email;
      if (emailTo) {
        await sendPackagePurchaseEmail(emailTo, {
          userName: profile?.full_name,
          packageName,
          totalClasses: classes,
          totalCost: cost,
          expiresAt: expiresAt.toISOString(),
        });
      }
    } catch (emailErr) {
      // Non-fatal: log but don't fail the webhook
      console.error('Failed to send package purchase email:', emailErr);
    }
  }

  return NextResponse.json({ received: true });
}
