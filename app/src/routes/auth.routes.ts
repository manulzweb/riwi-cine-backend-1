import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { LoginAuth } from '../controllers/auth.controller';
import { register, verifyEmail } from '../controllers/auth.controller';

const registerLimiter = rateLimit({
  windowMs: process.env.REGISTER_LIMIT_WINDOW_MS
    ? Number(process.env.REGISTER_LIMIT_WINDOW_MS)
    : 15 * 60 * 1000, // 15 minutes
  max: process.env.REGISTER_LIMIT_MAX_REQUESTS
    ? Number(process.env.REGISTER_LIMIT_MAX_REQUESTS)
    : 10, // limit each IP to 10 registration attempts per windowMs
  message: {
    error: process.env.REGISTER_LIMIT_MESSAGE || 'Demasiadas solicitudes de registro. Por favor intente más tarde.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

const router = Router();

router.post('/login', LoginAuth);

/**
 * POST /api/auth/register
 * -----------------------
 * Registra un nuevo usuario en la plataforma, creando su perfil,
 * membresía digital en estado Activa, billetera de bonos, preferencias de
 * notificación y genera un token temporal de activación por 24 horas.
 *
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario y membresía digital
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - confirmEmail
 *               - password
 *               - confirmPassword
 *               - phone
 *               - firstName
 *               - lastName
 *               - documentType
 *               - documentNumber
 *               - birthDate
 *               - cityId
 *               - personalDataConsent
 *               - termsConsent
 *             properties:
 *               email:
 *                 type: string
 *                 example: "usuario@example.com"
 *               confirmEmail:
 *                 type: string
 *                 example: "usuario@example.com"
 *               password:
 *                 type: string
 *                 example: "Password123!"
 *               confirmPassword:
 *                 type: string
 *                 example: "Password123!"
 *               phone:
 *                 type: string
 *                 example: "3001234567"
 *               firstName:
 *                 type: string
 *                 example: "Juan"
 *               lastName:
 *                 type: string
 *                 example: "Pérez"
 *               documentType:
 *                 type: string
 *                 example: "CC"
 *               documentNumber:
 *                 type: string
 *                 example: "12345678"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *               gender:
 *                 type: string
 *                 example: "Masculino"
 *               cityId:
 *                 type: integer
 *                 example: 1
 *               favoriteCinemaId:
 *                 type: integer
 *                 example: 2
 *               personalDataConsent:
 *                 type: boolean
 *                 example: true
 *               termsConsent:
 *                 type: boolean
 *                 example: true
 *               commercialConsent:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Registro exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Registro Exitoso. Revisa tu correo para activar tu cuenta."
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 12
 *                     email:
 *                       type: string
 *                       example: "usuario@example.com"
 *                     membershipCode:
 *                       type: string
 *                       example: "MC-482910-859201"
 *       400:
 *         description: Error de validación o datos incorrectos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La contraseña debe tener al menos 10 caracteres, incluir mayúscula, minúscula, número y caracter especial."
 *       500:
 *         description: Error interno del servidor
 */
router.post('/register', registerLimiter, register);

/**
 * POST /api/auth/verify-email
 * ---------------------------
 * Activa la cuenta de un usuario utilizando el token recibido por correo electrónico.
 *
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verificar correo y activar cuenta
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *                 example: "usuario@example.com"
 *               token:
 *                 type: string
 *                 example: "a6b7c8d9e0f1g2h3..."
 *     responses:
 *       200:
 *         description: Cuenta activada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cuenta Activada correctamente"
 *       400:
 *         description: Token inválido, expirado o correo no registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El token ha expirado, solicita uno nuevo"
 *       500:
 *         description: Error interno del servidor
 */
router.post('/verify-email', verifyEmail);

// TODO
// router.post('/refresh', refreshToken);
// router.post('/logout', logoutUser);
// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password', resetPassword);

export default router;