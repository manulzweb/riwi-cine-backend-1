// app/src/controllers/auth.controller.ts

import { CookieOptions, Request, Response } from 'express';
import authService from '../services/auth.service';
import { validateCredentials } from '../utils/auth.utils';
import { LoginUserRequestDto } from '../dto/request/login-user.dto';
import { RegisterUserRequestDto } from '../dto/request/register-user.dto';
import { VerifyEmailRequestDto } from '../dto/request/verify-email.dto';
import { RegisterUserResponseDto } from '../dto/response/register.user.dto';
import { envConfig } from '../config/env';
import { COOKIE_NAMES } from '../constant/auth.constant';
import {
  AccountAlreadyActivatedError,
  AccountLockedError,
  AccountNotActivatedError,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  InvalidTokenError,
  PasswordMismatchError,
  UserNotFoundError,
  WeakPasswordError,
} from '../errors/domain-errors';

/**
 * ============================================================================
 * Controlador de Autenticación
 * ============================================================================
 *
 * Este controlador gestiona las solicitudes HTTP relacionadas con el ciclo de
 * vida de la autenticación de los usuarios: registro, verificación de correo,
 * inicio de sesión, renovación de tokens, cierre de sesión y recuperación de
 * contraseña.
 *
 * Su única responsabilidad es actuar como intermediario entre el cliente
 * (HTTP) y la capa de servicios, delegando toda la lógica de negocio al `AuthService`.
 *
 * Responsabilidades:
 *  - Recibir y procesar las solicitudes HTTP.
 *  - Obtener la información enviada por el cliente (body, cookies, headers).
 *  - Realizar validaciones básicas de entrada antes de delegar.
 *  - Gestionar las cookies httpOnly (access token y refresh token).
 *  - Traducir los errores de dominio a códigos de estado HTTP apropiados.
 *  - Construir la respuesta HTTP.
 *
 * Este controlador NO debe:
 *  - Contener reglas de negocio (hash de contraseñas, emisión de tokens, etc.).
 *  - Acceder directamente a la base de datos.
 *  - Ejecutar consultas mediante Sequelize.
 *  - Exponer detalles internos o información sensible en las respuestas.
 *
 * Arquitectura:
 *
 * Cliente HTTP
 *      │
 * AuthController
 *      │
 * AuthService
 *      │
 * UserRepository / TokenRepository
 *      │
 * Sequelize
 *      │
 * PostgreSQL
 * ============================================================================
 */

/**
 * Registra un nuevo usuario en el sistema.
 *
 * Obtiene las credenciales del cuerpo de la solicitud, realiza las
 * validaciones básicas mediante `validateCredentials` y delega la creación
 * del usuario en `authService`.
 *
 * Cuando el registro es exitoso, devuelve el identificador del usuario creado.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Espera recibir en el body:
 * @example
 * {
 *   "name": "David Mtz",
 *   "email": "david@example.com",
 *   "password": "Secreta123!"
 * }
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP.
 *
 * @returns {Promise<void>}
 * Promesa que resuelve cuando la respuesta HTTP ha sido enviada.
 *
 * Posibles respuestas:
 *
 * - **201 Created**
 *   Usuario registrado correctamente. Devuelve `userId`.
 *
 * - **400 Bad Request**
 *   Credenciales inválidas de entrada (correo con formato incorrecto,
 *   contraseña débil o campos ausentes).
 *
 * - **409 Conflict**
 *   El correo electrónico ya se encuentra registrado. El mensaje no revela
 *   detalles internos de la implementación ni información adicional sobre
 *   el usuario existente.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante el procesamiento.
 *
 * @throws {EmailAlreadyExistsError}
 * Capturada internamente y retornada como HTTP 409.
 *
 * @security
 * - La contraseña no se devuelve al cliente.
 * - El hash y el salt nunca forman parte de la respuesta.
 * - Los errores inesperados se registran únicamente en el servidor y no
 *   exponen detalles internos al cliente.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const dto: RegisterUserRequestDto = req.body ?? {};
  const { email, password } = dto;

  const error = validateCredentials(email, password);
  if (error) {
    res.status(400).json({ message: error });
    return;
  }
  try {
    const { userId } = await authService.register(dto);

    res.status(201).json({
      message: 'User registered successfully',
      userId: userId,
    } as RegisterUserResponseDto);
  } catch (e) {
    /**
     * Se utiliza HTTP 409 (Conflict) cuando el correo ya se encuentra
     * registrado.
     *
     * El mensaje enviado al cliente no revela detalles internos de la
     * implementación ni información adicional sobre el usuario existente.
     */
    if (e instanceof EmailAlreadyExistsError) {
      res.status(409).json({
        message: 'Unable to register user with the provided email',
      } as RegisterUserResponseDto);

      return;
    }

    /**
     * Los errores inesperados se registran únicamente en el servidor.
     *
     * Nunca se devuelve el objeto de error original al cliente, evitando
     * exponer información sobre la infraestructura o implementación.
     */
    console.error('Registration error:', e);

    res.status(500).json({
      message: 'Internal server error',
    } as RegisterUserResponseDto);
  }
};

/**
 * Activa la cuenta de un usuario mediante un token de verificación.
 *
 * Recibe el token enviado al correo electrónico del usuario, construye el DTO
 * y delega la activación de la cuenta en `authService`.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Espera recibir en el body:
 * @example
 * {
 *   "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 * }
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP.
 *
 * @returns {Promise<Response>}
 * Promesa que resuelve una respuesta HTTP.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Cuenta activada correctamente.
 *
 * - **400 Bad Request**
 *   Token de verificación inválido o expirado.
 *
 * - **409 Conflict**
 *   La cuenta ya se encuentra activada previamente.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante el procesamiento.
 *
 * @throws {AccountAlreadyActivatedError}
 * Capturada internamente y retornada como HTTP 409.
 *
 * @throws {InvalidTokenError | UserNotFoundError}
 * Capturadas internamente y retornadas como HTTP 400. La respuesta no revela
 * si el correo existe ni el motivo exacto del fallo del token, evitando
 * exponer detalles internos.
 */
export const verifyEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const dto: VerifyEmailRequestDto = req.body;
    await authService.verifyEmail(dto);

    return res.status(200).json({
      message: 'Cuenta Activada correctamente',
    });
  } catch (error: unknown) {
    /**
     * La respuesta no revela si el correo existe ni el motivo exacto
     * del fallo del token, evitando exponer detalles internos.
     */
    if (error instanceof AccountAlreadyActivatedError) {
      return res.status(409).json({ message: 'Account is already activated' });
    }

    if (error instanceof InvalidTokenError || error instanceof UserNotFoundError) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    console.error('Email verification error:', error);

    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Autentica a un usuario en el sistema.
 *
 * Obtiene las credenciales de la solicitud, realiza las validaciones básicas
 * y delega la autenticación en `authService`.
 *
 * El servicio utiliza `bcrypt.compare` para verificar la contraseña y genera
 * un token JWT cuando las credenciales son válidas.
 *
 * En caso exitoso, establece las cookies httpOnly (`access_token` y
 * `refresh_token`) y devuelve el perfil del usuario junto con su membresía.
 *
 * @async
 *
 * @route POST /api/auth/login
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Espera recibir en el body:
 * @example
 * {
 *   "email": "david@example.com",
 *   "password": "Secreta123!"
 * }
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP y establecer las cookies.
 *
 * @returns {Promise<void>}
 * Promesa que resuelve cuando la respuesta HTTP ha sido enviada.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Autenticación exitosa. Devuelve `userId`, `profile` y `membership`.
 *
 * - **400 Bad Request**
 *   Credenciales inválidas de entrada (formato de correo o contraseña ausente).
 *
 * - **401 Unauthorized**
 *   Credenciales incorrectas.
 *
 * - **403 Forbidden**
 *   La cuenta está bloqueada temporalmente o aún no ha sido activada.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante el procesamiento.
 *
 * @throws {InvalidCredentialsError}
 * Capturada internamente y retornada como HTTP 401.
 *
 * @throws {AccountLockedError | AccountNotActivatedError}
 * Capturadas internamente y retornadas como HTTP 403.
 *
 * @security
 * - Nunca devuelve contraseñas, hashes ni salts.
 * - Utiliza un mensaje genérico para credenciales inválidas.
 * - No revela si el correo electrónico existe en el sistema.
 * - La autenticación de la contraseña es delegada a `bcrypt.compare`.
 * - Los tokens se devuelven como cookies httpOnly con `sameSite: strict`.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const dto: LoginUserRequestDto = req.body ?? {};
  const { email, password } = dto;

  const error = validateCredentials(email, password);
  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '';
    const userAgent = req.headers['user-agent'] || '';

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: envConfig.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: envConfig.COOKIE.MAXAGE,
    };

    const { userId, accessToken, refreshToken, profile, membership } = await authService.login(
      dto,
      ipAddress,
      userAgent,
    );

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, cookieOptions);
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, cookieOptions);

    res.status(200).json({
      message: 'Authentication successful',
      userId: userId,
      profile: profile,
      membership: membership,
    });
  } catch (e) {
    if (e instanceof InvalidCredentialsError) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    if (e instanceof AccountLockedError) {
      res.status(403).json({ message: 'Account is temporarily locked. Try again later.' });
      return;
    }
    if (e instanceof AccountNotActivatedError) {
      res.status(403).json({ message: 'Account is not activated' });
      return;
    }

    /**
     * Los errores inesperados se registran internamente, pero nunca se
     * exponen al cliente.
     */
    console.error('Authentication error:', e);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/**
 * Renueva el access token de la sesión a partir del refresh token.
 *
 * Obtiene el refresh token desde las cookies de la solicitud, lo valida
 * mediante `authService` y establece nuevas cookies con los tokens renovados.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Espera recibir la cookie:
 * @example
 * Cookie: refresh_token=<refresh token JWT>
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP y renovar las cookies.
 *
 * @returns {Promise<void>}
 * Promesa que resuelve cuando la respuesta HTTP ha sido enviada.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Token renovado correctamente. Devuelve `userId`, `profile` y `membership`.
 *
 * - **400 Bad Request**
 *   La cookie con el refresh token no fue enviada en la solicitud.
 *
 * - **401 Unauthorized**
 *   El refresh token es inválido o ha expirado.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante el procesamiento.
 *
 * @throws {InvalidTokenError}
 * Capturada internamente y retornada como HTTP 401.
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];

  if (!token) {
    res.status(400).json({ message: 'Refresh token is required' });
    return;
  }

  try {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: envConfig.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: envConfig.COOKIE.MAXAGE,
    };

    const {
      userId,
      accessToken,
      refreshToken: newRefreshToken,
      profile,
      membership,
    } = await authService.refreshToken(token);

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, cookieOptions);
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, newRefreshToken, cookieOptions);

    res.status(200).json({
      message: 'Token refreshed successfully',
      userId,
      profile,
      membership,
    });
  } catch (e) {
    if (e instanceof InvalidTokenError) {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
      return;
    }
    console.error('Refresh token error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Cierra la sesión del usuario.
 *
 * Obtiene el refresh token desde las cookies, lo revoca mediante `authService`
 * y elimina las cookies de access token y refresh token del cliente.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Espera recibir la cookie:
 * @example
 * Cookie: refresh_token=<refresh token JWT>
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP y limpiar las cookies.
 *
 * @returns {Promise<void>}
 * Promesa que resuelve cuando la respuesta HTTP ha sido enviada.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Sesión cerrada correctamente.
 *
 * - **400 Bad Request**
 *   La cookie con el refresh token no fue enviada en la solicitud.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante el procesamiento.
 */
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];

  if (!token) {
    res.status(400).json({ message: 'Refresh token is required for logout' });
    return;
  }

  try {
    await authService.logout(token);

    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN);
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (e) {
    console.error('Logout error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Solicita el restablecimiento de contraseña para una cuenta.
 *
 * Recibe el correo electrónico del usuario y delega en `authService` el envío
 * de un enlace de recuperación (si el correo existe en el sistema).
 *
 * La respuesta siempre es genérica para no revelar si el correo existe.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Espera recibir en el body:
 * @example
 * {
 *   "email": "david@example.com"
 * }
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP.
 *
 * @returns {Promise<void>}
 * Promesa que resuelve cuando la respuesta HTTP ha sido enviada.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Mensaje genérico indicando que, si el correo existe, se envió un enlace
 *   de restablecimiento.
 *
 * - **400 Bad Request**
 *   El correo electrónico no fue enviado en la solicitud.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante el procesamiento.
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body ?? {};

  if (!email) {
    res.status(400).json({ message: 'Email is required' });
    return;
  }

  try {
    await authService.forgotPassword({ email });
    res.status(200).json({ message: 'If the email exists, a reset link was sent' });
  } catch (e) {
    console.error('Forgot password error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Restablece la contraseña de una cuenta utilizando un token de recuperación.
 *
 * Recibe el token, el correo y la nueva contraseña (con su confirmación),
 * valida que todos los campos estén presentes y delega el cambio de
 * contraseña en `authService`.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Espera recibir en el body:
 * @example
 * {
 *   "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
 *   "email": "david@example.com",
 *   "newPassword": "NuevaSecreta123!",
 *   "confirmPassword": "NuevaSecreta123!"
 * }
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP.
 *
 * @returns {Promise<void>}
 * Promesa que resuelve cuando la respuesta HTTP ha sido enviada.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Contraseña restablecida correctamente.
 *
 * - **400 Bad Request**
 *   Campos ausentes, contraseñas que no coinciden, contraseña débil o token
 *   de restablecimiento inválido/expirado.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante el procesamiento.
 *
 * @throws {PasswordMismatchError | WeakPasswordError | InvalidTokenError}
 * Capturadas internamente y retornadas como HTTP 400.
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const dto: import('../dto/request/reset-password.dto').ResetPasswordRequestDto = req.body ?? {};

  if (!dto.token || !dto.email || !dto.newPassword || !dto.confirmPassword) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  try {
    await authService.resetPassword(dto);
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (e) {
    if (e instanceof PasswordMismatchError) {
      res.status(400).json({ message: 'Passwords do not match or are empty' });
      return;
    }
    if (e instanceof WeakPasswordError) {
      res.status(400).json({
        message:
          'Password must be at least 10 characters and include uppercase, lowercase, number and special character',
      });
      return;
    }
    if (e instanceof InvalidTokenError) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }
    console.error('Reset password error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};
