// app/src/dto/response/profile-detail.dto.ts

export interface ProfileDetailResponseDto {
  userId: number;
  email: string;
  isActive: boolean;
  profile: {
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    birthDate: Date | string | null;
    gender: string | null;
    phone: string;
    cityId: number;
    cityName?: string;
    favoriteCinemaId: number | null;
    favoriteCinemaName?: string;
  };
  membership: {
    code: string;
    qrCodeUrl: string;
    level: string;
    status: string;
    pointsBalance: number;
    discountPercentage: number;
  } | null;
  bonusWallet: {
    balance: number;
  } | null;
  notificationPreferences: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
  } | null;
}
