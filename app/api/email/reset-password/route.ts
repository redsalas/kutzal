import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://kutzal.mx';
    const redirectTo = `${origin}/login?mode=reset-password`;

    // Generate password reset link with admin client
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error('Error generating recovery link:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const resetLink = data?.properties?.action_link;
    if (!resetLink) {
      return NextResponse.json({ error: 'Failed to generate recovery link' }, { status: 500 });
    }

    // Get user full name if available
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('email', email)
      .single();

    // Send email using our Hostinger SMTP transport
    const emailResult = await sendPasswordResetEmail(email, resetLink, profile?.full_name);

    if (!emailResult.success) {
      console.error('Failed to send reset email via SMTP:', emailResult.error);
      return NextResponse.json(
        { error: typeof emailResult.error === 'string' ? emailResult.error : 'Error sending email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Internal error in password reset:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
