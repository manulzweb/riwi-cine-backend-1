// app/src/dto/function-detail.dto.ts

/**
 * DTOs de salida para HU-009 — Selección de Función y Formato de Proyección.
 *
 * Igual que movie-detail.dto.ts (HU-004), estos DTOs son el "contrato" de
 * lo que el frontend recibe. No exponemos el modelo de Sequelize
 * directamente para no filtrar campos internos (createdAt, roomId, etc.).
 */

/** GET /functions/{id} */
export interface FunctionDetailDto {
  id: number;
  movieId: number;
  movieTitle: string;
  dateTime: string;
  format: string;
  room: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  soldOut: boolean; // RN-015 (reutilizada aquí): sin sillas disponibles
}

/** GET /functions/{id}/prices */
export interface AppliedPromotionDto {
  name: string;
  discount: number;
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

/**
 * Filtros opcionales del listado de funciones de una película.
 * Permiten al frontend refrescar opciones sin recargar la página
 * (AC: "El usuario puede cambiar de formato sin recargar la página").
 */
export interface FunctionFiltersDto {
  /** Formato de proyección: 2D, 3D, IMAX, VIP. */
  format?: string;
  /** Fecha exacta de la función (YYYY-MM-DD). */
  date?: string;
  /** Identificador del complejo de cine. */
  cinemaId?: number;
}

/** GET /movies/{id}/functions */
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
  soldOut: boolean; // Disponibilidad de sillas en tiempo real
}
