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
