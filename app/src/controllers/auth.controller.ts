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
 * Controlador HTTP encargado de registrar nuevos usuarios.
 *
 * Obtiene las credenciales del cuerpo de la solicitud, realiza las
 * validaciones básicas y delega la creación del usuario en `authService`.
 *
 * Cuando el registro es exitoso, devuelve los datos públicos del usuario
 * junto con el token de acceso.
 *
 * @route POST /api/auth/register
 *
 * @param {Request} req Solicitud HTTP de Express.
 * @param {Response} res Respuesta HTTP de Express.
 *
 * @returns {Promise<void>}
 *
 * @throws
 * No propaga errores de aplicación al cliente. Los errores inesperados
 * se registran internamente y se responde con HTTP 500.
 *
 * @security
 * - La contraseña no se devuelve al cliente.
 * - El hash y el salt nunca forman parte de la respuesta.
 * - Los errores inesperados no exponen detalles internos.
 * - Un correo ya registrado genera HTTP 409.
 * - Las credenciales inválidas de entrada generan HTTP 400.
 */

/**
 * Controlador HTTP encargado de autenticar usuarios.
 *
 * Obtiene las credenciales de la solicitud, realiza las validaciones básicas
 * y delega la autenticación en `authService`.
 *
 * El servicio utiliza `bcrypt.compare` para verificar la contraseña y genera
 * un token JWT cuando las credenciales son válidas.
 *
 * @route POST /api/auth/login
 *
 * @param {Request} req Solicitud HTTP de Express.
 * @param {Response} res Respuesta HTTP de Express.
 *
 * @returns {Promise<void>}
 *
 * @throws
 * Los errores inesperados son manejados internamente y generan una respuesta
 * HTTP 500 sin revelar detalles de implementación.
 *
 * @security
 * - Nunca devuelve contraseñas, hashes ni salts.
 * - Utiliza un mensaje genérico para credenciales inválidas.
 * - No revela si el correo electrónico existe en el sistema.
 * - La autenticación de la contraseña es delegada a `bcrypt.compare`.
 * - El token se devuelve como un Bearer token.
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
