// app/src/dto/movie-detail.dto.ts

/**
 * DTOs de salida para HU-004 — Consulta del Detalle de una Película.
 *
 * Estos DTOs definen exactamente lo que el frontend va a recibir en cada
 * endpoint. Compártelos con el equipo de frontend como "contrato" antes
 * de que ellos empiecen a maquetar las pantallas.
 */

/** Precio agrupado por formato, para la sección "Valor de la entrada por formato". */
export interface PriceByFormatDto {
  format: string;   // "2D" | "3D" | "IMAX" | "VIP"
  price: number;
}

/** GET /movies/{id} */
export interface MovieDetailDto {
  id: number;
  title: string;
  synopsis: string;
  director: string;
  actors: string[];
  genres: string[];
  languages: string[];
  formats: string[];
  duration: number;
  classification: string;
  releaseDate: string;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string;
  averageRating: number;
  pricesByFormat: PriceByFormatDto[];
}

/** Item dentro de GET /movies/{id}/functions */
export interface MovieFunctionDto {
  id: number;
  dateTime: string;
  format: string;
  room: string;
  price: number;
  soldOut: boolean; // RN-015: los horarios agotados deben identificarse visualmente
}

/** Item dentro de GET /movies/{id}/recommendations */
export interface MovieRecommendationDto {
  id: number;
  title: string;
  posterUrl: string;
  averageRating: number;
}
