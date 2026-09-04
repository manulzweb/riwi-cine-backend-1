// app/src/dto/response/membership-detail.dto.ts

export interface MembershipDetailResponseDto {
  userId: number;
  code: string;
  qrCodeUrl: string;
  level: {
    name: string;
    description: string;
    discountPercentage: number;
  };
  status: {
    name: string;
    description: string;
  };
  pointsBalance: number;
  bonusBalance: number;
  createdAt: Date;
}
