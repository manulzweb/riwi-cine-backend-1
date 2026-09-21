// app/src/config/mailer.ts

import { MailtrapClient } from 'mailtrap';
import { envConfig } from './env.js';

export const mailtrapClient = new MailtrapClient({
  token: envConfig.MAILTRAP.TOKEN,
});

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  category?: string;
}

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  category = 'General',
}: SendEmailOptions): Promise<unknown> => {
  const recipients = (Array.isArray(to) ? to : [to]).map((email) => ({ email }));

  return mailtrapClient.send({
    from: {
      email: envConfig.MAILTRAP.SENDER_EMAIL,
      name: envConfig.MAILTRAP.SENDER_NAME,
    },
    to: recipients,
    subject,
    text: text ?? '',
    html,
    category,
  });
};

/**
 * Sanitiza y escapa caracteres HTML para prevenir vulnerabilidades de inyección HTML / XSS (VULN-06).
 * Convierte &, <, >, ", ' en sus entidades HTML seguras.
 */
export const escapeHtml = (unsafe?: string | null): string => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Plantilla base para todos los emails de MultiCine.
 */
const emailTemplate = ({
  title,
  content,
  footer = 'Este correo fue enviado automáticamente por MultiCine.',
}: {
  title: string;
  content: string;
  footer?: string;
}): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <meta name="color-scheme" content="dark light" />
  <meta name="supported-color-schemes" content="dark light" />

  <title>${escapeHtml(title)}</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #0f0f0f;
    font-family: Arial, Helvetica, sans-serif;
    color: #ffffff;
  "
>
  <table
    width="100%"
    border="0"
    cellpadding="0"
    cellspacing="0"
    role="presentation"
    style="
      width: 100%;
      margin: 0;
      padding: 40px 20px;
      background-color: #0f0f0f;
    "
  >
    <tr>
      <td align="center">

        <table
          width="600"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="
            width: 100%;
            max-width: 600px;
            background-color: #181818;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #292929;
          "
        >

          <!-- HEADER -->
          <tr>
            <td
              align="center"
              style="
                padding: 32px 30px;
                background-color: #111111;
                border-bottom: 1px solid #292929;
              "
            >
              <div
                style="
                  font-size: 30px;
                  font-weight: 800;
                  letter-spacing: 1px;
                  color: #e50914;
                "
              >
                MULTICINE
              </div>

              <div
                style="
                  margin-top: 8px;
                  font-size: 13px;
                  color: #999999;
                  letter-spacing: 0.5px;
                "
              >
                Tu cine, tus películas, tu experiencia.
              </div>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td
              style="
                padding: 40px 35px;
                background-color: #181818;
              "
            >
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td
              align="center"
              style="
                padding: 25px 30px;
                background-color: #111111;
                border-top: 1px solid #292929;
              "
            >
              <p
                style="
                  margin: 0;
                  font-size: 12px;
                  line-height: 18px;
                  color: #777777;
                "
              >
                ${escapeHtml(footer)}
              </p>

              <p
                style="
                  margin: 8px 0 0;
                  font-size: 12px;
                  color: #555555;
                "
              >
                © ${new Date().getFullYear()} MultiCine
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
};

/**
 * Email de activación de cuenta.
 */
export const sendActivationEmail = async (
  email: string,
  token: string,
  name?: string,
): Promise<void> => {
  const activationLink =
    `${envConfig.FRONTEND_URL}/activate?token=${token}` + `&email=${encodeURIComponent(email)}`;
  const safeName = name ? escapeHtml(name) : '';
  const greeting = safeName
    ? `¡Bienvenido a MultiCine, ${safeName}! 🎬`
    : '¡Bienvenido a MultiCine! 🎬';

  const html = emailTemplate({
    title: 'Activa tu cuenta',
    content: `
      <h1
        style="
          margin: 0 0 18px;
          font-size: 28px;
          line-height: 36px;
          color: #ffffff;
        "
      >
        ${greeting}
      </h1>

      <p
        style="
          margin: 0 0 18px;
          font-size: 16px;
          line-height: 26px;
          color: #cfcfcf;
        "
      >
        Gracias por registrarte.
        Solo necesitamos confirmar tu correo electrónico para activar
        tu cuenta y comenzar tu experiencia en MultiCine.
      </p>

      <table
        width="100%"
        border="0"
        cellpadding="0"
        cellspacing="0"
        role="presentation"
        style="margin: 30px 0;"
      >
        <tr>
          <td align="center">
            <a
              href="${activationLink}"
              style="
                display: inline-block;
                padding: 15px 30px;
                background-color: #e50914;
                color: #ffffff;
                text-decoration: none;
                font-size: 15px;
                font-weight: bold;
                border-radius: 8px;
              "
            >
              Activar mi cuenta
            </a>
          </td>
        </tr>
      </table>

      <div
        style="
          padding: 16px;
          background-color: #222222;
          border-radius: 8px;
          border-left: 4px solid #e50914;
        "
      >
        <p
          style="
            margin: 0;
            font-size: 13px;
            line-height: 20px;
            color: #aaaaaa;
          "
        >
          Este enlace de activación es válido durante
          <strong style="color: #ffffff;">24 horas</strong>.
        </p>
      </div>

      <p
        style="
          margin: 25px 0 0;
          font-size: 12px;
          line-height: 18px;
          color: #777777;
          word-break: break-all;
        "
      >
        Si el botón no funciona, copia y pega este enlace en tu navegador:
        <br />
        ${activationLink}
      </p>
    `,
  });

  await sendEmail({
    to: email,
    subject: 'Activa tu cuenta en MultiCine',
    category: 'Account Activation',
    html,
    text: `
Bienvenido a MultiCine.

Gracias por registrarte. Confirma tu correo electrónico para activar tu cuenta:

${activationLink}

Este enlace expira en 24 horas.
    `.trim(),
  });
};

/**
 * Email de recuperación de contraseña.
 */
export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  name?: string,
): Promise<void> => {
  const resetLink =
    `${envConfig.FRONTEND_URL}/reset-password?token=${token}` +
    `&email=${encodeURIComponent(email)}`;
  const safeName = name ? escapeHtml(name) : '';
  const greeting = safeName
    ? `<p style="margin: 0 0 18px; font-size: 16px; line-height: 26px; color: #cfcfcf;">Hola <strong>${safeName}</strong>,</p>`
    : '';

  const html = emailTemplate({
    title: 'Recuperación de contraseña',
    content: `
      <h1
        style="
          margin: 0 0 18px;
          font-size: 28px;
          line-height: 36px;
          color: #ffffff;
        "
      >
        Recuperación de contraseña 🔐
      </h1>

      ${greeting}
      <p
        style="
          margin: 0 0 18px;
          font-size: 16px;
          line-height: 26px;
          color: #cfcfcf;
        "
      >
        Hemos recibido una solicitud para restablecer la contraseña
        de tu cuenta de MultiCine.
      </p>

      <p
        style="
          margin: 0 0 25px;
          font-size: 16px;
          line-height: 26px;
          color: #cfcfcf;
        "
      >
        Haz clic en el siguiente botón para crear una nueva contraseña:
      </p>

      <table
        width="100%"
        border="0"
        cellpadding="0"
        cellspacing="0"
        role="presentation"
        style="margin: 30px 0;"
      >
        <tr>
          <td align="center">
            <a
              href="${resetLink}"
              style="
                display: inline-block;
                padding: 15px 30px;
                background-color: #e50914;
                color: #ffffff;
                text-decoration: none;
                font-size: 15px;
                font-weight: bold;
                border-radius: 8px;
              "
            >
              Restablecer contraseña
            </a>
          </td>
        </tr>
      </table>

      <div
        style="
          padding: 16px;
          background-color: #222222;
          border-radius: 8px;
          border-left: 4px solid #f5a623;
        "
      >
        <p
          style="
            margin: 0;
            font-size: 13px;
            line-height: 20px;
            color: #aaaaaa;
          "
        >
          Este enlace expira en
          <strong style="color: #ffffff;">1 hora</strong>.
        </p>
      </div>

      <p
        style="
          margin: 25px 0 0;
          font-size: 13px;
          line-height: 21px;
          color: #888888;
        "
      >
        Si tú no solicitaste este cambio, puedes ignorar este correo.
        Tu contraseña actual permanecerá sin cambios.
      </p>

      <p
        style="
          margin: 25px 0 0;
          font-size: 12px;
          line-height: 18px;
          color: #777777;
          word-break: break-all;
        "
      >
        Enlace directo:
        <br />
        ${resetLink}
      </p>
    `,
  });

  await sendEmail({
    to: email,
    subject: 'Recuperación de contraseña - MultiCine',
    category: 'Password Reset',
    html,
    text: `
Has solicitado restablecer la contraseña de tu cuenta MultiCine.

Utiliza este enlace para crear una nueva contraseña:

${resetLink}

Este enlace expira en 1 hora.

Si no solicitaste este cambio, ignora este correo.
    `.trim(),
  });
};

/**
 * Email de estreno de película.
 */
export const sendUpcomingReleaseEmail = async (
  email: string,
  movieTitle: string,
  name?: string,
): Promise<void> => {
  const moviesLink = envConfig.FRONTEND_URL;
  const safeMovieTitle = escapeHtml(movieTitle);
  const safeName = name ? escapeHtml(name) : '';
  const greeting = safeName
    ? `<p style="margin: 0 0 15px; font-size: 16px; line-height: 24px; text-align: center; color: #cfcfcf;">Hola <strong>${safeName}</strong>,</p>`
    : '';

  const html = emailTemplate({
    title: `Estreno: ${safeMovieTitle}`,
    content: `
      <div
        style="
          text-align: center;
          margin-bottom: 25px;
        "
      >
        <div
          style="
            display: inline-block;
            padding: 8px 15px;
            background-color: #2a090b;
            color: #e50914;
            border: 1px solid #5d1115;
            border-radius: 999px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
          "
        >
          ¡Nuevo estreno!
        </div>
      </div>

      <h1
        style="
          margin: 0 0 18px;
          font-size: 30px;
          line-height: 38px;
          text-align: center;
          color: #ffffff;
        "
      >
        ¡La espera ha terminado! 🍿
      </h1>

      ${greeting}
      <p
        style="
          margin: 0;
          font-size: 17px;
          line-height: 28px;
          text-align: center;
          color: #cfcfcf;
        "
      >
        <strong style="color: #ffffff;">
          ${safeMovieTitle}
        </strong>
        ya está disponible en cartelera.
      </p>

      <table
        width="100%"
        border="0"
        cellpadding="0"
        cellspacing="0"
        role="presentation"
        style="
          margin: 30px 0;
          background-color: #222222;
          border-radius: 10px;
        "
      >
        <tr>
          <td
            align="center"
            style="padding: 25px;"
          >
            <p
              style="
                margin: 0 0 10px;
                font-size: 14px;
                color: #999999;
              "
            >
              Prepárate para disfrutar
            </p>

            <p
              style="
                margin: 0;
                font-size: 22px;
                font-weight: bold;
                color: #ffffff;
              "
            >
              ${safeMovieTitle}
            </p>
          </td>
        </tr>
      </table>

      <table
        width="100%"
        border="0"
        cellpadding="0"
        cellspacing="0"
        role="presentation"
        style="margin: 30px 0;"
      >
        <tr>
          <td align="center">
            <a
              href="${moviesLink}"
              style="
                display: inline-block;
                padding: 15px 30px;
                background-color: #e50914;
                color: #ffffff;
                text-decoration: none;
                font-size: 15px;
                font-weight: bold;
                border-radius: 8px;
              "
            >
              Ver funciones disponibles
            </a>
          </td>
        </tr>
      </table>

      <p
        style="
          margin: 0;
          text-align: center;
          font-size: 13px;
          line-height: 20px;
          color: #888888;
        "
      >
        No te quedes sin tu entrada.
        Revisa los horarios disponibles en MultiCine.
      </p>
    `,
  });

  await sendEmail({
    to: email,
    subject: `¡Ya estrena "${movieTitle}"!`,
    category: 'Movie Release Notification',
    html,
    text: `
¡La espera ha terminado!

${movieTitle} ya está disponible en cartelera.

Consulta las funciones disponibles:
${moviesLink}

¡No te quedes sin tu entrada!
    `.trim(),
  });
};
