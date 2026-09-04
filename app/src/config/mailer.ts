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

export const sendActivationEmail = async (email: string, token: string): Promise<void> => {
  const activationLink = `${envConfig.FRONTEND_URL}/activate?token=${token}&email=${encodeURIComponent(email)}`;

  await sendEmail({
    to: email,
    subject: 'Activa tu cuenta en multicine',
    category: 'Account Activation',
    html: `<h2>Bienvenido a MultiCine!!</h2>
            <p>Gracias por registrarte. Confirma tu correo para activar tu cuentay membresía digital.</p>
            <p><a href="${activationLink}">Activar mi cuenta</a></p>
            <p>Este enlace expira en 24 horas.</p>`,
    text: `Bienvenido a MultiCine! Confirma tu correo para activar tu cuenta: ${activationLink}`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetLink = `${envConfig.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  await sendEmail({
    to: email,
    subject: 'Recuperación de contraseña',
    category: 'Password Reset',
    html: `<h2>Recuperación de contraseña</h2>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace para crear una nueva.</p>
            <p><a href="${resetLink}">Restablecer contraseña</a></p>
            <p>Este enlace expira en 1 hora. Si no solicitaste esto, ignora este mensaje.</p>`,
    text: `Has solicitado restablecer tu contraseña: ${resetLink}`,
  });
};

export const sendUpcomingReleaseEmail = async (
  email: string,
  movieTitle: string,
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: `¡Ya estrena "${movieTitle}"!`,
    category: 'Movie Release Notification',
    html: `<h2>¡La espera ha terminado!</h2>
            <p><strong>${movieTitle}</strong> ya está en cartelera.</p>
            <p>Entra a MultiCine y aparta tu entrada antes de que se agoten.</p>
            <p><a href="${envConfig.FRONTEND_URL}">Ver funciones disponibles</a></p>`,
    text: `¡La espera ha terminado! ${movieTitle} ya está en cartelera. Entra a MultiCine: ${envConfig.FRONTEND_URL}`,
  });
};
