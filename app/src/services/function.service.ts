// app/src/services/function.service.ts

import CinemaFunction from '../models/function.model';
import repository from '../repositories/function.repository';
import movieRepository from '../repositories/movie.repository';
import { IFunctionService } from './interfaces/function.service.interface';
import {
  FunctionNotFoundError,
  FunctionInactiveError,
  FunctionAlreadyStartedError,
  MovieNotFoundError,
} from '../errors/domain-errors';
import {
  FunctionDetailDto,
  FunctionPriceDto,
  AppliedPromotionDto,
  FunctionFiltersDto,
  FunctionSummaryDto,
} from '../dto/function-detail.dto';

/**
 * `CinemaFunction` no declara `movie` como propiedad de clase (la asociación
 * de Sequelize se resuelve en tiempo de ejecución vía `include`), así que la
 * tipamos aparte en vez de usar `any`.
 */
interface FunctionWithMovie extends CinemaFunction {
  movie?: { id: number; title: string } | null;
}

/**
 * Servicio de Funciones (HU-009)
 * ---------------------------------
 * Contiene la lógica de negocio de "Selección de Función y Formato de
 * Proyección":
 *
 *  - RN-035: No se podrán seleccionar funciones ya iniciadas.
 *  - RN-036: Solo se mostrarán funciones activas.
 *  - RN-037: El precio podrá variar según el formato, la sala y el horario.
 *  - RN-038: Las promociones se recalcularán automáticamente.
 */
class FunctionService implements IFunctionService {
  /**
   * GET /functions/{id}
   * Devuelve el detalle de una función, validando que sea seleccionable.
   */
  async getFunctionById(id: number): Promise<FunctionDetailDto> {
    const fn = await repository.findById(id);
    this.assertSelectable(fn, id);
    return this.toDetailDto(fn as FunctionWithMovie);
  }

  /**
   * GET /functions/{id}/prices
   * Calcula el precio de una función. RN-037 ya está resuelta a nivel de
   * datos: cada función tiene su propio `price`, definido según su formato,
   * sala y horario particulares (así lo asigna quien crea la función, ver
   * seeders/movie.seeder.ts). Lo que hace este método es RN-038: nunca se
   * guarda un "precio final" en la base de datos — se recalcula en cada
   * solicitud, dejando el arreglo `appliedPromotions` listo para que HU-011
   * (Carrito) enchufe descuentos de membresía/promociones sin tocar nada más.
   */
  async getFunctionPrices(id: number): Promise<FunctionPriceDto> {
    const fn = await repository.findById(id);
    this.assertSelectable(fn, id);

    const basePrice = fn.price;

    // Todavía no existe un módulo de promociones en el proyecto (llegará
    // con la épica de Membresía/Carrito). Se deja el arreglo vacío a
    // propósito, ya calculado "en caliente" en cada request.
    const appliedPromotions: AppliedPromotionDto[] = [];
    const totalDiscount = appliedPromotions.reduce((sum, p) => sum + p.discount, 0);

    return {
      functionId: fn.id,
      format: fn.format,
      room: fn.room,
      dateTime: fn.dateTime.toString(),
      basePrice,
      appliedPromotions,
      finalPrice: basePrice - totalDiscount,
    };
  }

  /**
   * GET /movies/{id}/functions
   * Lista las funciones seleccionables de una película (RN-035 y RN-036
   * se aplican desde la query del repositorio) con filtros opcionales
   * por formato, fecha y complejo. Cada ítem expone la disponibilidad
   * de sillas en tiempo real (`availableSeats`, `totalSeats`, `soldOut`).
   */
  async getFunctionsByMovie(
    movieId: number,
    filters: FunctionFiltersDto = {},
  ): Promise<FunctionSummaryDto[]> {
    const movie = await movieRepository.findById(movieId);
    if (!movie) {
      throw new MovieNotFoundError(`No se encontró la película con id ${movieId}.`);
    }

    const functions = await repository.findAllByMovie(movie.id, filters);
    return functions.map((fn) => this.toSummaryDto(fn));
  }

  // ---------------------------------------------------------------------
  // Helpers privados
  // ---------------------------------------------------------------------

  /**
   * Valida que la función exista, esté activa (RN-036) y no haya iniciado
   * todavía (RN-035). Se usa tanto en el detalle como en el cálculo de
   * precio, porque ambos forman parte del flujo de "selección".
   *
   * Es una "assertion function" de TypeScript: si no lanza error, el
   * compilador sabe que a partir de aquí `fn` ya no puede ser `null`.
   */
  private assertSelectable(fn: CinemaFunction | null, id: number): asserts fn is CinemaFunction {
    if (!fn) {
      throw new FunctionNotFoundError(`No se encontró la función con id ${id}.`);
    }

    if (!fn.active) {
      // RN-036
      throw new FunctionInactiveError();
    }

    if (new Date(fn.dateTime) <= new Date()) {
      // RN-035
      throw new FunctionAlreadyStartedError();
    }
  }

  private toSummaryDto(fn: CinemaFunction): FunctionSummaryDto {
    const room = fn.get('roomRelation') as { cinemaId?: number } | undefined;

    return {
      id: fn.id,
      movieId: fn.movieId,
      dateTime: fn.dateTime.toString(),
      format: fn.format,
      room: fn.room,
      cinemaId: room?.cinemaId ?? null,
      price: Number(fn.price),
      availableSeats: fn.availableSeats,
      totalSeats: fn.totalSeats,
      soldOut: fn.availableSeats <= 0,
    };
  }

  private toDetailDto(fn: FunctionWithMovie): FunctionDetailDto {
    return {
      id: fn.id,
      movieId: fn.movieId,
      movieTitle: fn.movie?.title ?? '',
      dateTime: fn.dateTime.toString(),
      format: fn.format,
      room: fn.room,
      price: fn.price,
      availableSeats: fn.availableSeats,
      totalSeats: fn.totalSeats,
      soldOut: fn.availableSeats <= 0,
    };
  }
}

export default new FunctionService();
