import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { sendPackagePurchaseEmail } from '@/lib/email';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  // Validate required env vars at request time (not module load) so the
  // server doesn't crash on startup when the key isn't set yet.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env and restart the server.');
    return NextResponse.json(
      { error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY missing' },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // Retrieve the session from Stripe to verify it's genuinely paid
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 });
    }

    const { userId, packageName, totalClasses, totalCost } = session.metadata ?? {};

    if (!userId || !packageName || !totalClasses || !totalCost) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    // Idempotency check: skip if already inserted (webhook may have already run)
    const { data: existing } = await supabaseAdmin
      .from('class_packages')
      .select('id')
      .eq('stripe_checkout_session_id', sessionId)
      .maybeSingle();

    if (existing) {
      // Already fulfilled — return success without duplicating
      return NextResponse.json({ ok: true, alreadyFulfilled: true });
    }

    const classes = parseInt(totalClasses, 10);
    const cost = parseInt(totalCost, 10);

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
      console.error('Fulfill insert error:', insertError);
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 });
    }

    // Send confirmation email (best-effort)
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
      console.error('Email send failed (non-fatal):', emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Fulfill error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
