// app/src/config/mailer.ts

import nodemailer from 'nodemailer';
import { envConfig } from './env';

const transporter = nodemailer.createTransport({
  host: envConfig.SMTP.HOST,
  port: Number(envConfig.SMTP.PORT || 587),
  secure: envConfig.SMTP.SECURE,
  auth: {
    user: envConfig.SMTP.USER,
    pass: envConfig.SMTP.PASS,
  },
});

export const sendActivationEmail = async (email: string, token: string): Promise<void> => {
  const activationLink = `${envConfig.FRONTEND_URL}/activate?token=${token}&email=${encodeURIComponent(email)}`;

  await transporter.sendMail({
    from: `"MultiCine" <${envConfig.SMTP.FROM}>`,
    to: email,
    subject: 'Activa tu cuenta en multicine',
    html: `<h2>Bienvenido a MultiCine!!</h2>
            <p>Gracias por registrarte. Confirma tu correo para activar tu cuentay membresía digital.</p>
            <p><a href="${activationLink}">Activar mi cuenta</a></p>
            <p>Este enlace expira en 24 horas.</p>`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetLink = `${envConfig.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  await transporter.sendMail({
    from: `"MultiCine" <${envConfig.SMTP.FROM}>`,
    to: email,
    subject: 'Recuperación de contraseña',
    html: `<h2>Recuperación de contraseña</h2>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace para crear una nueva.</p>
            <p><a href="${resetLink}">Restablecer contraseña</a></p>
            <p>Este enlace expira en 1 hora. Si no solicitaste esto, ignora este mensaje.</p>`,
  });
};

export const sendUpcomingReleaseEmail = async (
  email: string,
  movieTitle: string,
): Promise<void> => {
  await transporter.sendMail({
    from: `"MultiCine" <${envConfig.SMTP.FROM}>`,
    to: email,
    subject: `¡Ya estrena "${movieTitle}"!`,
    html: `<h2>¡La espera ha terminado!</h2>
            <p><strong>${movieTitle}</strong> ya está en cartelera.</p>
            <p>Entra a MultiCine y aparta tu entrada antes de que se agoten.</p>
            <p><a href="${envConfig.FRONTEND_URL}">Ver funciones disponibles</a></p>`,
  });
};
