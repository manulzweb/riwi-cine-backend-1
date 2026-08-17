// app/src/repositories/interfaces/function.repository.interface.ts

import CinemaFunction from '../../models/function.model';

/**
 * Contrato del Repositorio de Funciones (HU-009).
 */
export interface IFunctionRepository {
  /** Busca una función por id, incluyendo la película asociada. */
  findById(id: number): Promise<CinemaFunction | null>;
}
