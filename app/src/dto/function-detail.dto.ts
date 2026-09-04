// app/src/dto/function-detail.dto.ts

export interface FunctionFiltersDto {
  format?: string;
  date?: string;
  cinemaId?: number;
}

export interface AppliedPromotionDto {
  name: string;
  discount: number;
}

export interface FunctionDetailDto {
  id: number;
  movieId: number;
  movieTitle: string;
  dateTime: string;
  format: string;
  room: string;
  cinemaId: number | null;
  price: number;
  availableSeats: number;
  totalSeats: number;
  soldOut: boolean;
}

export interface FunctionPriceDto {
  functionId: number;
  format: string;
  room: string;
  dateTime: string;
  basePrice: number;
  appliedPromotions: AppliedPromotionDto[];
  finalPrice: number;
}

export interface FunctionSummaryDto {
  id: number;
  movieId: number;
  dateTime: string;
  format: string;
  room: string;
  cinemaId: number | null;
  price: number;
  availableSeats: number;
  totalSeats: number;
  soldOut: boolean;
}
