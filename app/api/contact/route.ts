import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, comments } = await request.json();

    if (!name || (!email && !phone) || !comments) {
      return NextResponse.json(
        { error: 'Nombre, comentarios y al menos un medio de contacto son requeridos.' },
        { status: 400 }
      );
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2328;">Nuevo mensaje de contacto — Kutzal</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #57606a; width: 140px;">Nombre</td>
            <td style="padding: 8px 0; color: #1f2328;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #57606a;">Email</td>
            <td style="padding: 8px 0; color: #1f2328;">${email || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #57606a;">Teléfono</td>
            <td style="padding: 8px 0; color: #1f2328;">${phone || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #57606a; vertical-align: top;">Mensaje</td>
            <td style="padding: 8px 0; color: #1f2328; white-space: pre-wrap;">${comments}</td>
          </tr>
        </table>
      </div>
    `;

    const result = await sendEmail({
      to: 'info@kutzal.mx',
      subject: `Contacto: ${name}`,
      html,
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Error al enviar el mensaje.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
