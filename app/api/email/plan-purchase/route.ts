import { NextRequest, NextResponse } from 'next/server';
import { sendPackagePurchaseEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, packageName, totalClasses, totalCost, expiresAt, userName } = await request.json();

    if (!email || !packageName || !totalClasses || !totalCost || !expiresAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendPackagePurchaseEmail(email, {
      userName,
      packageName,
      totalClasses,
      totalCost,
      expiresAt,
    });

    if (result.success) {
      return NextResponse.json(
        { message: 'Package purchase email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in package purchase email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
