import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { validateCredentials } from '../utils/auth.utils';
import { LoginUserRequestDto } from '../dto/request/login-user.dto';
import { RegisterUserRequestDto } from '../dto/request/register-user.dto';
import { VerifyEmailRequestDto } from '../dto/request/verify-email.dto';
import { RegisterUserResponseDto } from '../dto/response/register.user.dto';

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
    if (e instanceof Error && e.message === 'EMAIL_ALREADY_EXISTS') {
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
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(400).json({
      error: errorMessage,
    });
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
    const { userId, accessToken, refreshToken, profile, membership } = await authService.login(
      dto,
      ipAddress,
      userAgent,
    );

    res.status(200).json({
      message: 'Authentication successful',
      userId: userId,
      tokenType: 'Bearer',
      accessToken: accessToken,
      refreshToken: refreshToken,
      profile: profile,
      membership: membership,
    });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'Credenciales inválidas' || e.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }
      if (e.message.includes('bloqueada')) {
        res.status(403).json({ message: e.message });
        return;
      }
      if (e.message.includes('activada')) {
        res.status(403).json({ message: e.message });
        return;
      }
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
  const { token } = req.body ?? {};

  if (!token) {
    res.status(400).json({ message: 'Refresh token is required' });
    return;
  }

  try {
    const {
      userId,
      accessToken,
      refreshToken: newRefreshToken,
      profile,
      membership,
    } = await authService.refreshToken(token);

    res.status(200).json({
      message: 'Token refreshed successfully',
      userId,
      tokenType: 'Bearer',
      accessToken,
      refreshToken: newRefreshToken,
      profile,
      membership,
    });
  } catch (e) {
    if (e instanceof Error && e.message.includes('inválido')) {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
      return;
    }
    console.error('Refresh token error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body ?? {};

  if (!token) {
    res.status(400).json({ message: 'Refresh token is required for logout' });
    return;
  }

  try {
    await authService.logout(token);
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
    if (
      e instanceof Error &&
      (e.message.includes('inválido') ||
        e.message.includes('expirado') ||
        e.message.includes('coinciden') ||
        e.message.includes('seguridad'))
    ) {
      res.status(400).json({ message: e.message });
      return;
    }
    console.error('Reset password error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};
