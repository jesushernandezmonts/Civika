import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailService } from '@sendgrid/mail';
import { AppLogger } from '../common/logger/logger.service';
import * as dns from 'dns';

// Forzar la resolución DNS a IPv4 primero para evitar ENETUNREACH en servidores Cloud como Render
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignorar en versiones antiguas de Node
}

// ─── Paleta de marca Colegio Cívika ──────────────────────────────────────────
const CIVIKA_BRAND = {
  headerGradient: 'linear-gradient(135deg, #5b21b6 0%, #3730a3 100%)',
  gold: '#d97706',
  goldLight: '#fbbf24',
  dark: '#1e1b4b',
  muted: '#6b7280',
  bodyBg: '#f5f3ff',
  cardBg: '#ffffff',
  border: '#ede9fe',
  btnBg: 'linear-gradient(135deg, #5b21b6 0%, #3730a3 100%)',
};

function civikaHeader(): string {
  return `
    <div style="background:${CIVIKA_BRAND.headerGradient};padding:36px 32px 28px;text-align:center;border-radius:16px 16px 0 0;">
      <div style="margin-bottom:14px;">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M32 4L8 14V32C8 46.4 18.4 58.3 32 61.6C45.6 58.3 56 46.4 56 32V14L32 4Z" fill="#d97706" opacity="0.25"/>
          <path d="M32 8L12 17V32C12 44.5 20.9 55.2 32 58.3C43.1 55.2 52 44.5 52 32V17L32 8Z" fill="white" opacity="0.12"/>
          <text x="32" y="39" font-family="Georgia,serif" font-size="22" font-weight="bold" fill="#fbbf24" text-anchor="middle">C</text>
        </svg>
      </div>
      <h1 style="color:#ffffff;margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Colegio Cívika</h1>
      <p style="color:${CIVIKA_BRAND.goldLight};margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;">Portal Escolar Oficial</p>
    </div>`;
}

function civikaFooter(): string {
  return `
    <div style="background:#ede9fe;padding:20px 32px;border-top:1px solid ${CIVIKA_BRAND.border};border-radius:0 0 16px 16px;text-align:center;">
      <p style="font-size:11px;color:#9ca3af;margin:0;">
        &copy; ${new Date().getFullYear()} <strong>Colegio Cívika</strong> &mdash; Todos los derechos reservados.<br>
        Este mensaje es confidencial y está dirigido únicamente al destinatario indicado.
      </p>
    </div>`;
}

function civikaWrapper(body: string): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Colegio Cívika</title></head>
  <body style="margin:0;padding:24px 16px;background:${CIVIKA_BRAND.bodyBg};font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;border-radius:16px;overflow:hidden;border:1px solid ${CIVIKA_BRAND.border};box-shadow:0 4px 24px rgba(91,33,182,0.08);">
      ${civikaHeader()}
      <div style="padding:40px 32px;background:${CIVIKA_BRAND.cardBg};">${body}</div>
      ${civikaFooter()}
    </div>
  </body></html>`;
}

function ctaButton(href: string, label: string): string {
  return `
    <div style="text-align:center;margin:32px 0;">
      <a href="${href}" style="background:${CIVIKA_BRAND.btnBg};color:#ffffff;padding:16px 44px;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;display:inline-block;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(91,33,182,0.35);">${label}</a>
    </div>
    <p style="font-size:12px;color:${CIVIKA_BRAND.muted};text-align:center;margin:0 0 4px;">O copia y pega este enlace en tu navegador:</p>
    <p style="font-size:12px;color:#5b21b6;word-break:break-all;text-align:center;margin:0;">${href}</p>`;
}

function tipBox(text: string): string {
  return `
    <div style="margin-top:28px;padding:16px 20px;background:#f5f3ff;border-left:4px solid ${CIVIKA_BRAND.gold};border-radius:8px;">
      <p style="margin:0 0 4px;font-size:13px;color:#4c1d95;font-weight:600;">💡 Consejo</p>
      <p style="margin:0;font-size:12px;color:#5b21b6;line-height:1.5;">${text}</p>
    </div>`;
}

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter | null = null;
  private sgMail: MailService | null = null;
  private logger: AppLogger;

  constructor(private configService: ConfigService) {
    this.logger = new AppLogger('MailerService');

    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    const smtpHost = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = parseInt(this.configService.get<string>('SMTP_PORT') || '465', 10);

    // 1. Configurar Nodemailer con Gmail SMTP (Prioridad 1 para garantizar entrega a la Bandeja Principal)
    if (smtpUser && smtpPass && !smtpPass.includes('tu-') && !smtpPass.includes('cambiar-')) {
      const isGmail = smtpUser.includes('@gmail.com') || smtpHost.includes('gmail');

      this.transporter = nodemailer.createTransport({
        host: isGmail ? 'smtp.gmail.com' : smtpHost,
        port: isGmail ? 465 : smtpPort,
        secure: isGmail ? true : smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        family: 4, // Explicito para socket IPv4
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
      } as nodemailer.TransportOptions);

      this.logger.log(`📧 Servicio de correo inicializado con ${isGmail ? 'Gmail SSL (Puerto 465 IPv4)' : 'SMTP'} (${smtpUser})`);
    } else {
      this.logger.warn('⚠️ SMTP_USER o SMTP_PASS no están configurados en el entorno. Revisa tus variables de entorno.');
    }

    // 2. Configurar SendGrid como fallback opcional
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY') || '';
    if (apiKey && !apiKey.includes('tu-api-key')) {
      this.sgMail = new MailService();
      this.sgMail.setApiKey(apiKey);
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    const from = this.configService.get<string>('SMTP_FROM') || 'Colegio Cívika <jesushernandezmonts@gmail.com>';

    // A. Intentar envío directo con Gmail SMTP (Nodemailer)
    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, to, subject, html });
        this.logger.success(`Email enviado exitosamente a ${to} via Gmail SMTP`);
        return;
      } catch (error: any) {
        this.logger.error(`Error enviando email via Gmail SMTP: ${error.message}`, error.stack, 'MailerService');
      }
    }

    // B. Fallback a SendGrid
    if (this.sgMail) {
      try {
        await this.sgMail.send({ to, from, subject, html });
        this.logger.success(`Email enviado a ${to} via SendGrid`);
        return;
      } catch (error: any) {
        this.logger.error(`Error enviando email via SendGrid: ${error.message}`, error.stack, 'MailerService');
      }
    }

    // C. Fallback a Resend API (HTTP Puerto 443 - Garantizado en Render)
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    if (resendApiKey && !resendApiKey.includes('tu-key')) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Colegio Cívika <onboarding@resend.dev>',
            to: [to],
            subject,
            html,
          }),
        });

        if (response.ok) {
          this.logger.success(`Email enviado exitosamente a ${to} via Resend API`);
          return;
        } else {
          const errData = await response.json();
          this.logger.error(`Error enviando email via Resend API: ${JSON.stringify(errData)}`, '', 'MailerService');
        }
      } catch (error: any) {
        this.logger.error(`Error en la petición de Resend API: ${error.message}`, error.stack, 'MailerService');
      }
    }

    // D. Fallback a Brevo API (HTTP Puerto 443 - Permite cualquier destinatario sin dominio propio)
    const brevoApiKey = this.configService.get<string>('BREVO_API_KEY');
    if (brevoApiKey && !brevoApiKey.includes('tu-key')) {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'Colegio Cívika', email: 'jesushernandezmonts@gmail.com' },
            to: [{ email: to }],
            subject,
            htmlContent: html,
          }),
        });

        if (response.ok) {
          this.logger.success(`Email enviado exitosamente a ${to} via Brevo API`);
          return;
        } else {
          const errData = await response.json();
          this.logger.error(`Error enviando email via Brevo API: ${JSON.stringify(errData)}`, '', 'MailerService');
        }
      } catch (error: any) {
        this.logger.error(`Error en la petición de Brevo API: ${error.message}`, error.stack, 'MailerService');
      }
    }

    // D. Simulación si no hay transportes activos
    this.logger.email('MODO DESARROLLO/SIMULACIÓN: Email procesado');
    this.logger.email(`PARA: ${to}`);
    this.logger.email(`ASUNTO: ${subject}`);
    const link = html.match(/href="([^"]*)"/)?.[1];
    if (link) this.logger.info(`🔗 ENLACE: ${link}`);
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const body = `
      <h2 style="color:${CIVIKA_BRAND.dark};font-size:22px;margin:0 0 12px;">Restablecer Contraseña</h2>
      <p style="color:${CIVIKA_BRAND.muted};font-size:15px;line-height:1.7;margin:0 0 8px;">Estimado usuario,</p>
      <p style="color:${CIVIKA_BRAND.muted};font-size:15px;line-height:1.7;margin:0 0 24px;">
        Hemos recibido una solicitud para restablecer la contraseña de su cuenta en el
        <strong>Portal Escolar de Colegio Cívika</strong>. Presione el siguiente botón
        para crear una contraseña nueva:
      </p>
      ${ctaButton(resetUrl, '🔐 Restablecer mi Contraseña')}
      <p style="font-size:12px;color:#b45309;text-align:center;margin-top:20px;background:#fffbeb;border-radius:8px;padding:10px 16px;">
        ⏰ Este enlace expirará en <strong>15 minutos</strong>.
        Si usted no realizó esta solicitud, puede ignorar este mensaje.
      </p>`;

    await this.sendMail(
      email,
      'Restablecer Contraseña — Portal Escolar Colegio Cívika',
      civikaWrapper(body),
    );
  }

  async sendActivationEmail(email: string, token: string, nombre: string, tallerNombre?: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const activationUrl = `${frontendUrl}/accept-invitation?token=${token}`;

    const rolTexto = tallerNombre
      ? `como personal de apoyo en <strong>${tallerNombre}</strong>`
      : 'como Secretaria del plantel';

    const body = `
      <h2 style="color:${CIVIKA_BRAND.dark};font-size:22px;margin:0 0 12px;">Bienvenida al Sistema Escolar</h2>
      <p style="color:${CIVIKA_BRAND.muted};font-size:15px;line-height:1.7;margin:0 0 8px;">Estimada <strong>${nombre}</strong>,</p>
      <p style="color:${CIVIKA_BRAND.muted};font-size:15px;line-height:1.7;margin:0 0 24px;">
        La Dirección General de <strong>Colegio Cívika</strong> le ha habilitado
        acceso al <strong>Portal Escolar</strong> ${rolTexto}.
        Para activar su cuenta e iniciar sesión con su cuenta de Google, presione
        el siguiente botón:
      </p>
      ${ctaButton(activationUrl, '✅ Activar mi Cuenta')}
      <p style="font-size:12px;color:#b45309;text-align:center;margin-top:20px;background:#fffbeb;border-radius:8px;padding:10px 16px;">
        ⏰ Este enlace expirará en <strong>24 horas</strong>.
        Si no reconoce esta invitación, puede ignorar este mensaje.
      </p>
      ${tipBox(`Le recomendamos guardar la dirección <strong>${frontendUrl}</strong> en los
        <strong>Favoritos (⭐)</strong> de su navegador o añadir el acceso directo
        a la pantalla de inicio de su teléfono para ingresar fácilmente cada día.`)}`;

    await this.sendMail(
      email,
      'Acceso al Portal Escolar — Colegio Cívika',
      civikaWrapper(body),
    );
  }

  async sendAlumnoActivationEmail(email: string, token: string, nombre: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const activationUrl = `${frontendUrl}/alumno/activar-cuenta?token=${token}`;

    const body = `
      <h2 style="color:${CIVIKA_BRAND.dark};font-size:22px;margin:0 0 12px;">Su cuenta en el Portal Escolar está lista</h2>
      <p style="color:${CIVIKA_BRAND.muted};font-size:15px;line-height:1.7;margin:0 0 8px;">Estimado Padre de Familia / Tutor de <strong>${nombre}</strong>,</p>
      <p style="color:${CIVIKA_BRAND.muted};font-size:15px;line-height:1.7;margin:0 0 24px;">
        La Secretaría de <strong>Colegio Cívika</strong> ha registrado a su hijo(a) en el
        <strong>Portal Escolar</strong>. A través de este portal podrá consultar y descargar los
        <strong>recibos oficiales de colegiatura</strong>, ver <strong>circulares y avisos
        escolares</strong>, y mantenerse al día con los pagos del ciclo escolar.
      </p>
      <p style="color:${CIVIKA_BRAND.muted};font-size:15px;line-height:1.7;margin:0 0 24px;">
        Presione el siguiente botón para crear su contraseña de acceso:
      </p>
      ${ctaButton(activationUrl, '🏫 Acceder al Portal Escolar')}
      <div style="margin-top:28px;padding:20px 24px;background:#f5f3ff;border-radius:12px;border:1px solid #ede9fe;">
        <p style="margin:0 0 12px;font-size:14px;color:${CIVIKA_BRAND.dark};font-weight:700;">📋 ¿Qué encontrará en el Portal?</p>
        <ul style="margin:0;padding-left:20px;font-size:13px;color:#5b21b6;line-height:1.9;">
          <li>Recibos oficiales de colegiatura en PDF</li>
          <li>Historial completo de pagos realizados</li>
          <li>Circulares y avisos escolares</li>
          <li>Datos de contacto del plantel</li>
        </ul>
      </div>
      <p style="font-size:12px;color:#b45309;text-align:center;margin-top:20px;background:#fffbeb;border-radius:8px;padding:10px 16px;">
        ⏰ Este enlace expirará en <strong>7 días</strong>.
        Si usted no esperaba este correo, puede ignorarlo con seguridad.
      </p>
      ${tipBox(`Guarde la dirección <strong>${frontendUrl}</strong> en los
        <strong>Favoritos (⭐)</strong> de su navegador para acceder rápidamente
        cuando necesite consultar un recibo o un aviso escolar.`)}`;

    await this.sendMail(
      email,
      'Bienvenido al Portal Escolar — Colegio Cívika',
      civikaWrapper(body),
    );
  }
}
