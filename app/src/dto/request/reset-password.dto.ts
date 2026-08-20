export interface ResetPasswordRequestDto {
  email: string;
  token: string;
  newPassword?: string;
  confirmPassword?: string;
}
