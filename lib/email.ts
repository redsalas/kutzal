import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Email clients require a publicly accessible HTTPS URL for images.
// Make sure NEXT_PUBLIC_APP_URL is set to your production domain in .env
const LOGO_URL = `${APP_URL}/images/logo-header.webp`;

// Shared header HTML used in all templates
function emailHeader(): string {
  return `
    <div style="background-color:#3d4a35;padding:28px 40px;text-align:center;">
      <img src="${LOGO_URL}" alt="Kutzal" style="height:48px;width:auto;display:inline-block;" />
    </div>
  `;
}

// Shared footer HTML used in all templates
function emailFooter(): string {
  return `
    <div style="text-align:center;padding:24px 40px;color:#888;font-size:12px;border-top:1px solid #e5e7eb;">
      <p style="margin:0 0 4px 0;">© ${new Date().getFullYear()} Kutzal Studio. Todos los derechos reservados.</p>
      <p style="margin:0;">info@kutzal.mx</p>
    </div>
  `;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Kutzal <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Email notification functions
export async function sendWelcomeEmail(email: string, userName?: string) {
  const subject = '¡Bienvenido a Kutzal!';
  const html = getWelcomeEmailTemplate(userName || email);
  return sendEmail({ to: email, subject, html });
}

export async function sendReservationEmail(
  email: string,
  reservationDetails: {
    className?: string;
    date?: string;
    time?: string;
    instructor?: string;
    location?: string;
  }
) {
  const subject = 'Confirmación de Reservación — Kutzal';
  const html = getReservationEmailTemplate(reservationDetails);
  return sendEmail({ to: email, subject, html });
}

export async function sendPackagePurchaseEmail(
  email: string,
  details: {
    userName?: string;
    packageName: string;
    totalClasses: number;
    totalCost: number;
    expiresAt: string; // ISO date string
  }
) {
  const subject = `¡Compra confirmada! ${details.packageName} — Kutzal`;
  const html = getPackagePurchaseEmailTemplate(details);
  return sendEmail({ to: email, subject, html });
}

// ─── Email Templates ──────────────────────────────────────────────────────────

function getWelcomeEmailTemplate(userName: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f7f8fa;font-family:'Helvetica Neue',Arial,sans-serif;color:#1f2328;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f8fa;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr><td>${emailHeader()}</td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;font-size:22px;color:#1f2328;">¡Bienvenido a Kutzal, ${userName}!</h2>
          <p style="margin:0 0 16px;color:#57606a;line-height:1.7;">Estamos muy contentos de tenerte en nuestra comunidad. En Kutzal, fusionamos vitalidad física con bienestar mental y espiritual en un ambiente de sofisticación y energía.</p>
          <p style="margin:0 0 24px;color:#57606a;line-height:1.7;">Para comenzar, recuerda que tienes una <strong>clase muestra gratuita</strong> esperándote.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${APP_URL}/clases" style="display:inline-block;padding:14px 32px;background-color:#4a5c3f;color:#ffffff;text-decoration:none;border-radius:24px;font-weight:600;font-size:15px;">Reservar mi clase muestra</a>
          </div>
        </td></tr>
        <tr><td>${emailFooter()}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function getReservationEmailTemplate(details: {
  className?: string;
  date?: string;
  time?: string;
  instructor?: string;
  location?: string;
}): string {
  const rows = [
    { label: 'Clase',       value: details.className },
    { label: 'Fecha',       value: details.date },
    { label: 'Hora',        value: details.time },
    { label: 'Instructor',  value: details.instructor },
    { label: 'Ubicación',   value: details.location },
  ].filter((r) => r.value);

  const tableRows = rows
    .map(
      (r, i) => `
      <tr style="background:${i % 2 === 0 ? '#f7f8fa' : '#ffffff'};">
        <td style="padding:12px 16px;font-weight:600;color:#1f2328;width:40%;font-size:14px;">${r.label}</td>
        <td style="padding:12px 16px;color:#57606a;font-size:14px;">${r.value}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f7f8fa;font-family:'Helvetica Neue',Arial,sans-serif;color:#1f2328;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f8fa;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr><td>${emailHeader()}</td></tr>
        <tr><td style="padding:40px 40px 24px;">
          <div style="text-align:center;margin-bottom:28px;">
            <div style="display:inline-block;width:56px;height:56px;background-color:#4a5c3f;border-radius:50%;text-align:center;line-height:56px;font-size:26px;color:#fff;">✓</div>
          </div>
          <h2 style="margin:0 0 8px;font-size:22px;text-align:center;color:#1f2328;">Reservación Confirmada</h2>
          <p style="margin:0 0 28px;text-align:center;color:#57606a;">Tu clase ha sido reservada exitosamente.</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;margin-bottom:24px;">
            ${tableRows}
          </table>

          <div style="background-color:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin-bottom:28px;">
            <p style="margin:0;font-size:13px;color:#854d0e;"><strong>Recordatorio:</strong> Por favor llega 10 minutos antes de tu clase. Trae calcetines, toalla y agua.</p>
          </div>

          <div style="text-align:center;">
            <a href="${APP_URL}/perfil" style="display:inline-block;padding:14px 32px;background-color:#4a5c3f;color:#ffffff;text-decoration:none;border-radius:24px;font-weight:600;font-size:15px;">Ver mis reservaciones</a>
          </div>
        </td></tr>
        <tr><td>${emailFooter()}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function getPackagePurchaseEmailTemplate(details: {
  userName?: string;
  packageName: string;
  totalClasses: number;
  totalCost: number;
  expiresAt: string;
}): string {
  const expiry = new Date(details.expiresAt).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const today = new Date().toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f7f8fa;font-family:'Helvetica Neue',Arial,sans-serif;color:#1f2328;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f8fa;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr><td>${emailHeader()}</td></tr>
        <tr><td style="padding:40px 40px 24px;">
          <div style="text-align:center;margin-bottom:28px;">
            <div style="display:inline-block;width:56px;height:56px;background-color:#4a5c3f;border-radius:50%;text-align:center;line-height:56px;font-size:26px;color:#fff;">✓</div>
          </div>
          <h2 style="margin:0 0 8px;font-size:22px;text-align:center;color:#1f2328;">¡Compra Exitosa!</h2>
          <p style="margin:0 0 28px;text-align:center;color:#57606a;">
            ${details.userName ? `Hola ${details.userName}, tu` : 'Tu'} paquete ha sido activado.
          </p>

          <!-- Package summary card -->
          <div style="background-color:#4a5c3f;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 4px;color:#c8d5b9;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Paquete adquirido</p>
            <p style="margin:0 0 16px;color:#ffffff;font-size:22px;font-weight:700;">${details.packageName}</p>
            <p style="margin:0;color:#ffffff;font-size:48px;font-weight:800;line-height:1;">${details.totalClasses}</p>
            <p style="margin:4px 0 0;color:#c8d5b9;font-size:14px;">clase${details.totalClasses > 1 ? 's' : ''} disponible${details.totalClasses > 1 ? 's' : ''}</p>
          </div>

          <!-- Details table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;margin-bottom:24px;">
            <tr style="background:#f7f8fa;">
              <td style="padding:12px 16px;font-weight:600;color:#1f2328;width:40%;font-size:14px;">Paquete</td>
              <td style="padding:12px 16px;color:#57606a;font-size:14px;">${details.packageName}</td>
            </tr>
            <tr style="background:#ffffff;">
              <td style="padding:12px 16px;font-weight:600;color:#1f2328;font-size:14px;">Total pagado</td>
              <td style="padding:12px 16px;color:#57606a;font-size:14px;">$${details.totalCost} MXN</td>
            </tr>
            <tr style="background:#f7f8fa;">
              <td style="padding:12px 16px;font-weight:600;color:#1f2328;font-size:14px;">Fecha de compra</td>
              <td style="padding:12px 16px;color:#57606a;font-size:14px;">${today}</td>
            </tr>
            <tr style="background:#ffffff;">
              <td style="padding:12px 16px;font-weight:600;color:#1f2328;font-size:14px;">Válido hasta</td>
              <td style="padding:12px 16px;color:#57606a;font-size:14px;">${expiry}</td>
            </tr>
          </table>

          <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 18px;margin-bottom:28px;">
            <p style="margin:0;font-size:13px;color:#166534;">Tienes <strong>${details.totalClasses} clase${details.totalClasses > 1 ? 's' : ''}</strong> para usar antes del <strong>${expiry}</strong>. ¡Empieza a reservar!</p>
          </div>

          <div style="text-align:center;">
            <a href="${APP_URL}/reservar" style="display:inline-block;padding:14px 32px;background-color:#4a5c3f;color:#ffffff;text-decoration:none;border-radius:24px;font-weight:600;font-size:15px;">Reservar mi primera clase</a>
          </div>
          <p style="text-align:center;margin-top:16px;">
            <a href="${APP_URL}/perfil" style="color:#4a5c3f;font-size:13px;">Ver mis paquetes →</a>
          </p>
        </td></tr>
        <tr><td>${emailFooter()}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
