// app/src/routes/auth.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../containers/auth.container.js';
import { envConfig } from '../config/env.js';
import { verifyCaptcha } from '../middleware/captcha.middleware.js';

const registerLimiter = rateLimit({
  windowMs: envConfig.REGISTER.WINDOW_MS,
  max: envConfig.REGISTER.MAX_REQUESTS,
  message: {
    error: envConfig.REGISTER.MESSAGE,
  },
  skip: () => envConfig.NODE_ENV === 'test',
});

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    error: 'Demasiados intentos de inicio de sesión. Por favor, intenta de nuevo en 5 minutos.',
  },
  skip: () => envConfig.NODE_ENV === 'test',
});

const router = Router();

/**
 * POST /auth/login
 * --------------------
 * Autentica un usuario existente y genera un token JWT de acceso.
 *
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autenticar usuario y generar token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authentication successful"
 *                 userId:
 *                   type: integer
 *                   example: 12
 *                 tokenType:
 *                   type: string
 *                   example: "Bearer"
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Datos inválidos o credenciales incorrectas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', loginLimiter, authController.login);

/**
 * POST /auth/register
 * -----------------------
 * Registra un nuevo usuario en la plataforma, creando su perfil,
 * membresía digital en estado Activa, billetera de bonos, preferencias de
 * notificación y genera un token temporal de activación por 24 horas.
 *
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario y membresía digital
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       captchaToken:
 *         type: string
 *         description: "Token generado por el widget reCAPTCHA v2 del frontend"
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
 *                   example: "User registered successfully"
 *                 userId:
 *                   type: integer
 *                   example: 12
 *       400:
 *         description: Error de validación o datos incorrectos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "La contraseña debe tener al menos 10 caracteres, incluir mayúscula, minúscula, número y caracter especial."
 *       403:
 *         description: Verificación capthca fallido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Captcha verification failed"
 *
 *       409:
 *         description: El correo electrónico ya se encuentra registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se pudo registrar el usuario con el correo proporcionado"
 *       500:
 *         description: Error interno del servidor
 */
router.post('/register', registerLimiter, verifyCaptcha(), authController.register);

/**
 * POST /auth/verify-email
 * ---------------------------
 * Activa la cuenta de un usuario utilizando el token recibido por correo electrónico.
 *
 * @swagger
 * /auth/verify-email:
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
router.post('/verify-email', authController.verifyEmail);

/**
 * POST /auth/refresh
 * -------------------
 * Renueva el token de acceso utilizando un refresh token válido (RN-028, RN-029, RN-030).
 *
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar tokens de autenticación
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de refresco (opcional si se envía vía cookie httpOnly)
 *                 example: "{{refreshToken}}"
 *     responses:
 *       200:
 *         description: Tokens renovados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token refreshed successfully"
 *                 userId:
 *                   type: integer
 *                   example: 1
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   example: "d3b07384d113edec49eaa6238ad5ff00..."
 *                 tokenType:
 *                   type: string
 *                   example: "Bearer"
 *       400:
 *         description: Token de refresco no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Refresh token is required"
 *       401:
 *         description: Token inválido, expirado o revocado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/refresh', authController.refreshToken);

/**
 * POST /auth/logout
 * -----------------
 * Cierra la sesión revocando los tokens activos y limpiando cookies (RN-030).
 *
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión y revocar tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de refresco a revocar (opcional si se envía vía cookie)
 *                 example: "{{refreshToken}}"
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       400:
 *         description: Token de refresco no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Refresh token is required for logout"
 *       500:
 *         description: Error interno del servidor
 */
router.post('/logout', authController.logoutUser);

/**
 * POST /auth/forgot-password
 * --------------------------
 * Inicia el flujo de recuperación de contraseña enviando un correo si la cuenta existe.
 *
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@example.com"
 *     responses:
 *       200:
 *         description: Correo de restablecimiento enviado si la cuenta existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "If the email exists, a reset link was sent"
 *       400:
 *         description: Correo electrónico requerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email is required"
 *       500:
 *         description: Error interno del servidor
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * POST /auth/reset-password
 * -------------------------
 * Restablece la contraseña del usuario utilizando el token recibido por correo electrónico.
 *
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con token de recuperación
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
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@example.com"
 *               token:
 *                 type: string
 *                 example: "a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p1"
 *               newPassword:
 *                 type: string
 *                 example: "NewPassword123!"
 *               confirmPassword:
 *                 type: string
 *                 example: "NewPassword123!"
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password has been reset successfully"
 *       400:
 *         description: Campos requeridos faltantes, contraseñas no coincidentes o token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All fields are required"
 *       500:
 *         description: Error interno del servidor
 */
router.post('/reset-password', authController.resetPassword);

export default router;
