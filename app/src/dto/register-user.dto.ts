// app/src/dto/register-user.dto.ts

export interface RegisterUserDto {
  // Contact Information / Credentials
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
  phone: string;

  // Personal Information
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  birthDate: string; // ISO date string (YYYY-MM-DD)
  gender?: string;

  // Preferences
  cityId: number;
  favoriteCinemaId?: number;

  // Consents
  personalDataConsent: boolean;
  termsConsent: boolean;
  commercialConsent?: boolean;
}