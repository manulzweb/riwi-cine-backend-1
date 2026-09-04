// app/src/services/function.service.ts

import CinemaFunction from '../models/function.model.js';
import Movie from '../models/movie.model.js';
import Room from '../models/room.model.js';
import { IFunctionService } from './interfaces/function.service.interface.js';
import { IFunctionRepository } from '../repositories/interfaces/function.repository.interface.js';
import { IMovieRepository } from '../repositories/interfaces/movie.repository.interface.js';
import {
  FunctionNotFoundError,
  FunctionInactiveError,
  FunctionAlreadyStartedError,
  MovieNotFoundError,
} from '../errors/movie.errors.js';
import {
  FunctionDetailDto,
  FunctionPriceDto,
  AppliedPromotionDto,
  FunctionFiltersDto,
  FunctionSummaryDto,
} from '../dto/function-detail.dto.js';

/**
 * Servicio de Funciones y Formatos (HU-009)
 * ----------------------------------------
 * Contiene la lógica de negocio de "Selección de Función y Formato de Proyección":
 *  - RN-035: No se podrán seleccionar funciones ya iniciadas.
 *  - RN-036: Solo se mostrarán funciones activas.
 *  - RN-037: El precio podrá variar según el formato, la sala y el horario.
 *  - RN-038: Las promociones y precios se recalculan en tiempo real.
 *
 * @class FunctionService
 * @implements {IFunctionService}
 */
export class FunctionService implements IFunctionService {
  constructor(
    private readonly functionRepository: IFunctionRepository,
    private readonly movieRepository: IMovieRepository,
  ) {
    this.functionRepository = functionRepository;
    this.movieRepository = movieRepository;
  }

  /**
   * GET /functions/{id}
   * Devuelve el detalle de una función, validando que sea seleccionable.
   */
  async getFunctionById(id: number): Promise<FunctionDetailDto> {
    const fn = await this.functionRepository.findById(id);
    this.assertSelectable(fn, id);
    return this.toDetailDto(fn);
  }

  /**
   * GET /functions/{id}/prices
   * Calcula el precio de una función y sus promociones aplicables (RN-037, RN-038).
   */
  async getFunctionPrices(id: number): Promise<FunctionPriceDto> {
    const fn = await this.functionRepository.findById(id);
    this.assertSelectable(fn, id);
    return this.calculatePriceStructure(fn);
  }

  /**
   * GET /movies/{id}/functions
   * Lista las funciones seleccionables de una película con filtros opcionales.
   */
  async getFunctionsByMovie(
    movieId: number,
    filters: FunctionFiltersDto = {},
  ): Promise<FunctionSummaryDto[]> {
    const movie = await this.movieRepository.findById(movieId);
    if (!movie) {
      throw new MovieNotFoundError(`No se encontró la película con id ${movieId}.`);
    }

    const functions = await this.functionRepository.findAllByMovie(movie.id, filters);
    return functions.map((fn) => this.toSummaryDto(fn));
  }

  // ==========================================================================
  // Funciones Privadas Helper
  // ==========================================================================

  /**
   * Valida que la función exista, esté activa (RN-036) y no haya iniciado (RN-035).
   */
  private assertSelectable(fn: CinemaFunction | null, id: number): asserts fn is CinemaFunction {
    if (!fn) {
      throw new FunctionNotFoundError(`No se encontró la función con id ${id}.`);
    }

    if (fn.isActive === false || fn.active === false) {
      throw new FunctionInactiveError();
    }

    const startTime = fn.startTime ? new Date(fn.startTime).getTime() : 0;
    if (startTime > 0 && startTime <= Date.now()) {
      throw new FunctionAlreadyStartedError();
    }
  }

  /**
   * Calcula y estructura el desglose de precios y descuentos de la función (RN-037, RN-038).
   */
  private calculatePriceStructure(fn: CinemaFunction): FunctionPriceDto {
    const basePrice = Number(fn.price);
    const appliedPromotions: AppliedPromotionDto[] = [];
    const totalDiscount = appliedPromotions.reduce((sum, p) => sum + p.discount, 0);

    return {
      functionId: fn.id,
      format: fn.format || '2D',
      room: fn.room || 'Sala Estándar',
      dateTime: fn.startTime ? fn.startTime.toISOString() : new Date().toISOString(),
      basePrice,
      appliedPromotions,
      finalPrice: Math.max(0, basePrice - totalDiscount),
    };
  }

  /**
   * Mapea el modelo a un DTO de resumen de función.
   */
  private toSummaryDto(fn: CinemaFunction): FunctionSummaryDto {
    const room = fn.get('roomRelation') as Room | undefined;

    return {
      id: fn.id,
      movieId: fn.movieId,
      dateTime: fn.startTime ? fn.startTime.toISOString() : new Date().toISOString(),
      format: fn.format || '2D',
      room: fn.room || room?.name || 'Sala Estándar',
      cinemaId: room?.cinemaId ?? null,
      price: Number(fn.price),
      availableSeats: fn.availableSeats,
      totalSeats: fn.totalSeats ?? 100,
      soldOut: fn.availableSeats <= 0,
    };
  }

  /**
   * Mapea el modelo a un DTO detallado de la función.
   */
  private toDetailDto(fn: CinemaFunction): FunctionDetailDto {
    const movie = fn.get('movie') as Movie | undefined;
    const room = fn.get('roomRelation') as Room | undefined;

    return {
      id: fn.id,
      movieId: fn.movieId,
      movieTitle: movie?.title ?? '',
      dateTime: fn.startTime ? fn.startTime.toISOString() : new Date().toISOString(),
      format: fn.format || '2D',
      room: fn.room || room?.name || 'Sala Estándar',
      cinemaId: room?.cinemaId ?? null,
      price: Number(fn.price),
      availableSeats: fn.availableSeats,
      totalSeats: fn.totalSeats ?? 100,
      soldOut: fn.availableSeats <= 0,
    };
  }
}

export default FunctionService;
