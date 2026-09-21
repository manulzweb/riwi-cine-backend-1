// app/src/dto/request/reset-password.dto.ts

export interface ResetPasswordRequestDto {
  email: string;
  token: string;
  newPassword?: string;
  confirmPassword?: string;
}
