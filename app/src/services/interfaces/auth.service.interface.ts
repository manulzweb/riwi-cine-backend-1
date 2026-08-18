import { LoginUserRequestDto } from '../../dto/request/login-user.dto';
import { RegisterUserRequestDto } from '../../dto/request/register-user.dto';
import { VerifyEmailRequestDto } from '../../dto/request/verify-email.dto';

export interface LoginUserResult {
  userId: number;
  accessToken: string;
}

export interface RegisterUserResult {
  userId: number;
  membershipCode: string;
  isActive: boolean;
}

export interface IAuthService {
  register(dto: RegisterUserRequestDto): Promise<RegisterUserResult>;
  login(dto: LoginUserRequestDto): Promise<LoginUserResult>;
  verifyEmail(dto: VerifyEmailRequestDto): Promise<void>;
}
