import { ProfileAttributes } from '../../models/profile.model';
import { MembershipAttributes } from '../../models/membership.model';
import { ForgotPasswordRequestDto } from '../../dto/request/forgot-password.dto';
import { LoginUserRequestDto } from '../../dto/request/login-user.dto';
import { RegisterUserRequestDto } from '../../dto/request/register-user.dto';
import { ResetPasswordRequestDto } from '../../dto/request/reset-password.dto';
import { VerifyEmailRequestDto } from '../../dto/request/verify-email.dto';

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
