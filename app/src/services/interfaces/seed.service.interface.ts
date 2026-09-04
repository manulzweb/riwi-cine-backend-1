// app/src/services/interfaces/seed.service.interface.ts

export interface SeedPayload {
  countries?: Array<{
    name: string;
  }>;
  departments?: Array<{
    name: string;
    countryName?: string;
    countryId?: number;
  }>;
  cities?: Array<{
    name: string;
    departmentName?: string;
    departmentId?: number;
  }>;
  cinemas?: Array<{
    name: string;
    address: string;
    cityName?: string;
    cityId?: number;
    isActive?: boolean;
  }>;
  rooms?: Array<{
    name: string;
    cinemaId?: number;
    cinemaName?: string;
    format?: string;
    capacity: number;
    isActive?: boolean;
  }>;
  seatTypes?: Array<{
    name: string;
    description?: string;
    priceFactor?: number;
  }>;
  movies?: Array<{
    title: string;
    synopsis: string;
    director?: string;
    actors?: string[];
    genres?: string[];
    languages?: string[];
    formats?: string[];
    duration: number;
    rating?: string | number;
    genre?: string;
    posterUrl?: string;
    bannerUrl?: string;
    trailerUrl?: string;
    releaseDate?: string;
    isActive?: boolean;
  }>;
  snacks?: Array<{
    name: string;
    description?: string;
    category: string;
    price: number;
    stock: number;
    imageUrl?: string;
    discountPercentage?: number;
  }>;
  promotions?: Array<{
    name: string;
    snackName?: string;
    snackId?: number;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    startDate: string;
    endDate: string;
    isActive?: boolean;
  }>;
  users?: Array<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roleName?: string;
    documentType?: string;
    documentNumber?: string;
    cityName?: string;
    cityId?: number;
  }>;
}

export interface SeedResult {
  countries: number;
  departments: number;
  cities: number;
  cinemas: number;
  rooms: number;
  seatTypes: number;
  movies: number;
  snacks: number;
  promotions: number;
  users: number;
}

export interface ISeedService {
  seedFromBuffer(buffer: Buffer): Promise<SeedResult>;
  seedFromPayload(payload: SeedPayload): Promise<SeedResult>;
}
