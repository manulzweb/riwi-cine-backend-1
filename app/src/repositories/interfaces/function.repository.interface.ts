// app/src/repositories/interfaces/function.repository.interface.ts

import CinemaFunction from '../../models/function.model';
import { FunctionFiltersDto } from '../../dto/function-detail.dto';

/**
 * Contrato del Repositorio de Funciones (HU-009).
 */
export interface IFunctionRepository {
  /** Busca una función por id, incluyendo la película asociada. */
  findById(id: number): Promise<CinemaFunction | null>;

  /**
   * Lista las funciones seleccionables de una película (HU-009).
   *
   * Aplica desde la query las reglas de negocio RN-035 y RN-036
   * (solo funciones activas con fecha futura) y los filtros
   * opcionales por formato, fecha y complejo de cine.
   */
  findAllByMovie(movieId: number, filters?: FunctionFiltersDto): Promise<CinemaFunction[]>;
}
