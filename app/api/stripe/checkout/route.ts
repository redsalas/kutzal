import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PACKAGE_OPTIONS } from '@/lib/packages';

export async function POST(request: NextRequest) {
  try {
    const { packageId, userId, userEmail } = await request.json();

    if (!packageId || !userId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pkg = PACKAGE_OPTIONS.find((p) => p.id === packageId);
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            unit_amount: pkg.price * 100, // Stripe uses cents
            product_data: {
              name: pkg.name,
              description: `${pkg.classes} clase${pkg.classes > 1 ? 's' : ''} de Pilates en Kutzal Studio. Válido por 1 mes.`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        packageId,
        packageName: pkg.name,
        totalClasses: pkg.classes.toString(),
        totalCost: pkg.price.toString(),
      },
      success_url: `${origin}/compra-exitosa?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/clases?cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}
