// app/src/services/movie.service.ts

import Movie from "../models/movie.model";
import { FilterMoviesDto } from "../dto/filter-movies.dto";
import repository from "../repositories/movie.repository";
import { IMovieService } from "./interfaces/movie.service.interface";

/**
 * Servicio de Películas
 * ---------------------
 * Contiene toda la lógica de negocio relacionada con la entidad Movie.
 *
 * Responsabilidades:
 *  - Validar reglas de negocio.
 *  - Coordinar operaciones entre uno o varios repositorios.
 *  - Mantener al controlador libre de lógica de negocio.
 *
 * Reglas de negocio aplicadas:
 *
 *  RN-010: Solo se muestran funciones activas.
 *  RN-011: Si el filtro "available" es true, se excluyen funciones agotadas.
 *  RN-012: La cartelera siempre cubre los próximos siete días.
 *  RN-013: La información refleja el estado actual de las funciones.
 *
 * El Service conoce las reglas del negocio.
 * El Repository únicamente conoce cómo guardar y consultar información.
 */

class MovieService implements IMovieService {
  /**
   * Obtiene todas las películas activas en cartelera.
   *
   * @async
   * @returns {Promise<Movie[]>} Promesa que resuelve con un arreglo de películas activas.
   *
   * @example
   * const movies = await movieService.findAll();
   * // [{ id: 1, title: "Spider-Man", genre: "Acción", ... }]
   */
  async findAll(): Promise<Movie[]> {
    return await repository.findAll();
  }

  /**
   * Obtiene las películas con funciones disponibles en los próximos 7 días.
   *
   * Aplica la regla de negocio RN-012: la cartelera siempre cubre
   * exactamente siete días contados desde el día actual.
   *
   * @async
   * @returns {Promise<Movie[]>} Promesa que resuelve con las películas de la semana.
   *
   * @example
   * const weekly = await movieService.findWeekly();
   * // Películas con funciones entre hoy y los próximos 7 días
   */
  async findWeekly(): Promise<Movie[]> {
    return await repository.findWeekly();
  }

  /**
   * Obtiene las películas con funciones disponibles el día de hoy.
   *
   * @async
   * @returns {Promise<Movie[]>} Promesa que resuelve con las películas de hoy.
   *
   * @example
   * const today = await movieService.findToday();
   * // Películas con funciones programadas para el día actual
   */
  async findToday(): Promise<Movie[]> {
    return await repository.findToday();
  }

  /**
   * Obtiene películas aplicando filtros opcionales.
   *
   * Aplica la regla de negocio RN-011: si el filtro `available` es true,
   * se excluyen las funciones sin asientos disponibles.
   *
   * @async
   * @param {FilterMoviesDto} filters - Filtros opcionales enviados por el cliente.
   * @returns {Promise<Movie[]>} Promesa que resuelve con las películas filtradas.
   *
   * @example
   * const filtered = await movieService.findByFilters({ genre: "Acción", available: true });
   * // Películas de acción con asientos disponibles
   */
  async findByFilters(filters: FilterMoviesDto): Promise<Movie[]> {
    return await repository.findByFilters(filters);
  }
}

export default new MovieService();
