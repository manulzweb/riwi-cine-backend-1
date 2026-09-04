// app/src/dto/response/membership-benefits.dto.ts

export interface MembershipBenefitItem {
  type: string;
  title: string;
  description: string;
  discountPercentage?: number;
  value?: number;
}

export interface MembershipBenefitsResponseDto {
  currentLevel: string;
  discountPercentage: number;
  pointsBalance: number;
  bonusBalance: number;
  benefits: MembershipBenefitItem[];
  nextLevel: {
    name: string;
    discountPercentage: number;
    pointsRequired: number;
    pointsRemaining: number;
  } | null;
}
