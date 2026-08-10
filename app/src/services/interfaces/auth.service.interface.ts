import { RegisterUserDto } from "../../dto/register-user.dto";
import { VerifyEmailDto } from "../../dto/verify-email.dto";

export interface RegisterResult {
    userId: number;
    email: string;
}

export interface IAuthService {
    register(dto: RegisterUserDto): Promise<RegisterResult>;
    verifyEmail(dto: VerifyEmailDto): Promise<void>;
}