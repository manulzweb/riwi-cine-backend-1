import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendActivationEmail = async (email: string, token: string): Promise<void> => {
  const activationLink = `${process.env.FRONTEND_URL}/activate?token=${token}&email=${encodeURIComponent(email)}`;

  await transporter.sendMail({
    from: `"MultiCine" <${process.env.SMTP_FROM || process.env.SMTP_User}`,
    to: email,
    subject: 'Activa tu cuenta en multicine',
    html: `<h2>Bienvenido a MultiCine!!</h2>
            <p>Gracias por registrarte. Confirma tu correo para activar tu cuentay membresía digital.</p>
            <p><a href="${activationLink}">Activar mi cuenta</a></p>
            <p>Este enlace expira en 24 horas.</p>`,
  });
};