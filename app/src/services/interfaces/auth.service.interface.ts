// app/src/services/interfaces/auth.service.interface.ts

import { ProfileAttributes } from '../../models/profile.model.js';
import { MembershipAttributes } from '../../models/membership.model.js';
import { ForgotPasswordRequestDto } from '../../dto/request/forgot-password.dto.js';
import { LoginUserRequestDto } from '../../dto/request/login-user.dto.js';
import { RegisterUserRequestDto } from '../../dto/request/register-user.dto.js';
import { ResetPasswordRequestDto } from '../../dto/request/reset-password.dto.js';
import { VerifyEmailRequestDto } from '../../dto/request/verify-email.dto.js';

export interface LoginUserResult {
  userId: number;
  accessToken: string;
  refreshToken: string;
  profile: ProfileAttributes | null;
  membership: MembershipAttributes | null;
}

export interface RegisterUserResult {
  userId: number;
  membershipCode: string;
  isActive: boolean;
}

export interface IAuthService {
  register(dto: RegisterUserRequestDto): Promise<RegisterUserResult>;
  login(
    dto: LoginUserRequestDto,
    ipAddress?: string,
    deviceUserAgent?: string,
  ): Promise<LoginUserResult>;
  verifyEmail(dto: VerifyEmailRequestDto): Promise<void>;
  refreshToken(token: string): Promise<LoginUserResult>;
  logout(token: string): Promise<void>;
  forgotPassword(dto: ForgotPasswordRequestDto): Promise<void>;
  resetPassword(dto: ResetPasswordRequestDto): Promise<void>;
}
