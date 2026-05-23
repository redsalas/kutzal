import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
  const subject = '¡Bienvenido a Kutzal Pilates Clásico!';
  const html = getWelcomeEmailTemplate(userName || email);
  
  return sendEmail({ to: email, subject, html });
}

export async function sendPlanPurchaseEmail(
  email: string,
  planName: string,
  planDetails: {
    price?: string;
    duration?: string;
    features?: string[];
  }
) {
  const subject = `Confirmación de compra - ${planName}`;
  const html = getPlanPurchaseEmailTemplate(planName, planDetails);
  
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
  const subject = 'Confirmación de Reservación - Kutzal';
  const html = getReservationEmailTemplate(reservationDetails);
  
  return sendEmail({ to: email, subject, html });
}

// Email Templates (placeholders - to be customized)
function getWelcomeEmailTemplate(userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8B9D83; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #8B9D83; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-style: italic;">Kutzal</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; letter-spacing: 2px;">PILATES CLÁSICO</p>
          </div>
          <div class="content">
            <h2>¡Bienvenido a Kutzal, ${userName}!</h2>
            <p>Estamos emocionados de tenerte en nuestra comunidad de Pilates Clásico.</p>
            
            <!-- TODO: Customize welcome message -->
            <p>En Kutzal, fusionamos vitalidad física con bienestar mental y espiritual en un ambiente de sofisticación y energía.</p>
            
            <p>Próximos pasos:</p>
            <ul>
              <li>Explora nuestras clases disponibles</li>
              <li>Elige el plan que mejor se adapte a ti</li>
              <li>Reserva tu primera clase</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="button">
                Explorar Clases
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Kutzal Pilates Clásico. Todos los derechos reservados.</p>
            <!-- TODO: Add contact information and social media links -->
          </div>
        </div>
      </body>
    </html>
  `;
}

function getPlanPurchaseEmailTemplate(
  planName: string,
  details: { price?: string; duration?: string; features?: string[] }
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8B9D83; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .plan-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .checkmark { color: #8B9D83; font-size: 48px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-style: italic;">Kutzal</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; letter-spacing: 2px;">PILATES CLÁSICO</p>
          </div>
          <div class="content">
            <div class="checkmark">✓</div>
            <h2 style="text-align: center;">¡Compra Confirmada!</h2>
            <p style="text-align: center;">Gracias por elegir Kutzal</p>
            
            <div class="plan-details">
              <h3>Detalles de tu Plan</h3>
              <p><strong>Plan:</strong> ${planName}</p>
              ${details.price ? `<p><strong>Precio:</strong> ${details.price}</p>` : ''}
              ${details.duration ? `<p><strong>Duración:</strong> ${details.duration}</p>` : ''}
              
              ${details.features && details.features.length > 0 ? `
                <p><strong>Incluye:</strong></p>
                <ul>
                  ${details.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
            
            <!-- TODO: Add payment receipt details -->
            <!-- TODO: Add next steps and how to use the plan -->
            
            <p style="text-align: center; margin-top: 30px;">
              ¿Tienes preguntas? Contáctanos en cualquier momento.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Kutzal Pilates Clásico. Todos los derechos reservados.</p>
            <!-- TODO: Add contact information -->
          </div>
        </div>
      </body>
    </html>
  `;
}

function getReservationEmailTemplate(details: {
  className?: string;
  date?: string;
  time?: string;
  instructor?: string;
  location?: string;
  isRescheduled?: boolean;
  previousDate?: string;
  previousTime?: string;
}): string {
  const isRescheduled = details.isRescheduled || false;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8B9D83; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .reservation-card { background-color: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B9D83; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .button { display: inline-block; padding: 12px 30px; background-color: #8B9D83; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .reschedule-notice { background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-style: italic;">Kutzal</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; letter-spacing: 2px;">PILATES CLÁSICO</p>
          </div>
          <div class="content">
            <h2 style="text-align: center;">${isRescheduled ? 'Clase Reprogramada' : 'Reservación Confirmada'}</h2>
            <p style="text-align: center;">${isRescheduled ? 'Tu clase ha sido reprogramada' : 'Tu clase ha sido reservada exitosamente'}</p>
            
            ${isRescheduled && details.previousDate && details.previousTime ? `
              <div class="reschedule-notice">
                <p style="margin: 0 0 10px 0;"><strong>📅 Cambio de horario</strong></p>
                <p style="margin: 0; font-size: 14px;">
                  <strong>Clase anterior:</strong> ${details.previousDate} a las ${details.previousTime}
                </p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">
                  <strong>Nueva fecha:</strong> ${details.date} a las ${details.time}
                </p>
              </div>
            ` : ''}
            
            <div class="reservation-card">
              <h3 style="margin-top: 0;">Detalles de tu Reservación</h3>
              
              ${details.className ? `
                <div class="info-row">
                  <strong>Clase:</strong>
                  <span>${details.className}</span>
                </div>
              ` : ''}
              
              ${details.date ? `
                <div class="info-row">
                  <strong>Fecha:</strong>
                  <span>${details.date}</span>
                </div>
              ` : ''}
              
              ${details.time ? `
                <div class="info-row">
                  <strong>Hora:</strong>
                  <span>${details.time}</span>
                </div>
              ` : ''}
              
              ${details.instructor ? `
                <div class="info-row">
                  <strong>Instructor:</strong>
                  <span>${details.instructor}</span>
                </div>
              ` : ''}
              
              ${details.location ? `
                <div class="info-row" style="border-bottom: none;">
                  <strong>Ubicación:</strong>
                  <span>${details.location}</span>
                </div>
              ` : ''}
            </div>
            
            <!-- TODO: Add calendar invite attachment -->
            <!-- TODO: Add cancellation policy -->
            <!-- TODO: Add what to bring to class -->
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Recordatorio:</strong> Por favor llega 10 minutos antes de tu clase.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reservar" class="button">
                Ver Mis Reservaciones
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Kutzal Pilates Clásico. Todos los derechos reservados.</p>
            <!-- TODO: Add contact information and location -->
          </div>
        </div>
      </body>
    </html>
  `;
}


