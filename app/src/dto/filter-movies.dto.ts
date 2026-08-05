// app/src/dto/filter-movies.dto.ts

/**
 * DTO - Filtros de Películas
 * --------------------------
 * Este DTO representa los filtros opcionales que el cliente puede enviar
 * para consultar la cartelera semanal.
 *
 * Todos los campos son opcionales. Si no se envía ninguno,
 * se retornan todas las películas activas.
 */

export interface FilterMoviesDto {
  /**
   * Fecha específica para consultar funciones (formato YYYY-MM-DD).
   */
  date?: string;

  /**
   * Género de la película (ej. Acción, Drama, Comedia).
   */
  genre?: string;

  /**
   * Clasificación de edad (ej. G, PG, PG-13, R).
   */
  classification?: string;

  /**
   * Idioma de la película (ej. Español, Inglés).
   */
  language?: string;

  /**
   * Formato de la sala (2D, 3D, IMAX, VIP).
   */
  format?: string;

  /**
   * Identificador del complejo de cine.
   */
  cinemaId?: number;

  /**
   * Si es true, excluye las funciones sin asientos disponibles (RN-011).
   */
  available?: boolean;
}
