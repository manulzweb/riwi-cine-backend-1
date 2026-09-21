// app/src/dto/request/update-profile.dto.ts

export interface UpdateProfileRequestDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  cityId?: number;
  favoriteCinemaId?: number;
  notificationPreferences?: {
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    pushEnabled?: boolean;
  };
}
