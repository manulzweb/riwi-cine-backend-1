// app/src/controllers/auth.controller.ts

import { CookieOptions, Request, Response } from 'express';
import { IAuthService } from '../services/interfaces/auth.service.interface.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { validateCredentials } from '../utils/auth.utils.js';
import { LoginUserRequestDto } from '../dto/request/login-user.dto.js';
import { RegisterUserRequestDto } from '../dto/request/register-user.dto.js';
import { VerifyEmailRequestDto } from '../dto/request/verify-email.dto.js';
import { ForgotPasswordRequestDto } from '../dto/request/forgot-password.dto.js';
import { ResetPasswordRequestDto } from '../dto/request/reset-password.dto.js';
import { RegisterUserResponseDto } from '../dto/response/register.user.dto.js';
import { envConfig } from '../config/env.js';
import { COOKIE_NAMES } from '../constant/auth.constant.js';

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
 * Responsabilidades:
 *  - Recibir y procesar las solicitudes HTTP.
 *  - Validar los parámetros básicos de entrada.
 *  - Gestionar las cookies httpOnly (access token y refresh token).
 *  - Delegar la lógica al servicio `IAuthService`.
 *  - Responder con los códigos HTTP adecuados (200, 201, 400).
 *
 * Arquitectura:
 * Cliente HTTP → Container (wiring) → AuthController → AuthService → Repositories → PostgreSQL
 * ============================================================================
 */
export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  /**
   * Registra un nuevo usuario en el sistema con su membresía digital inicial.
   */
  public register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto: RegisterUserRequestDto = req.body ?? {};
    const { email, password } = dto;

    const validationError = validateCredentials(email, password);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const { userId } = await this.authService.register(dto);

    res.status(201).json({
      message: 'User registered successfully',
      userId,
    } as RegisterUserResponseDto);
  });

  /**
   * Activa la cuenta de un usuario mediante su token de verificación.
   */
  public verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto: VerifyEmailRequestDto = req.body;
    await this.authService.verifyEmail(dto);

    res.status(200).json({
      message: 'Cuenta Activada correctamente',
    });
  });

  /**
   * Autentica a un usuario y establece las cookies de sesión.
   */
  public login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto: LoginUserRequestDto = req.body ?? {};
    const { email, password } = dto;

    const validationError = validateCredentials(email, password);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '';
    const userAgent = req.headers['user-agent'] || '';

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: envConfig.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: envConfig.COOKIE.MAXAGE,
    };

    const { userId, accessToken, refreshToken, profile, membership } = await this.authService.login(
      dto,
      ipAddress,
      userAgent,
    );

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, cookieOptions);
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, cookieOptions);

    res.status(200).json({
      message: 'Authentication successful',
      userId,
      profile,
      membership,
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    });
  });

  /**
   * Renueva el token de acceso utilizando el refresh token.
   */
  public refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const token =
      req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] ??
      (req.body as { refreshToken?: string } | undefined)?.refreshToken;

    if (!token) {
      res.status(400).json({ message: 'Refresh token is required' });
      return;
    }

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
    } = await this.authService.refreshToken(token);

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, cookieOptions);
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, newRefreshToken, cookieOptions);

    res.status(200).json({
      message: 'Token refreshed successfully',
      userId,
      profile,
      membership,
      accessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
    });
  });

  /**
   * Cierra la sesión revocando los tokens y limpiando cookies.
   */
  public logoutUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const token =
      req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] ??
      (req.body as { refreshToken?: string } | undefined)?.refreshToken;

    if (!token) {
      res.status(400).json({ message: 'Refresh token is required for logout' });
      return;
    }

    await this.authService.logout(token);

    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN);
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN);

    res.status(200).json({ message: 'Logged out successfully' });
  });

  /**
   * Inicia la solicitud de restablecimiento de contraseña.
   */
  public forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body ?? {};

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    await this.authService.forgotPassword({ email } as ForgotPasswordRequestDto);
    res.status(200).json({ message: 'If the email exists, a reset link was sent' });
  });

  /**
   * Restablece la contraseña del usuario utilizando el token recibido.
   */
  public resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto: ResetPasswordRequestDto = req.body ?? {};

    if (!dto.token || !dto.email || !dto.newPassword || !dto.confirmPassword) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    await this.authService.resetPassword(dto);
    res.status(200).json({ message: 'Password has been reset successfully' });
  });
}

export default AuthController;
