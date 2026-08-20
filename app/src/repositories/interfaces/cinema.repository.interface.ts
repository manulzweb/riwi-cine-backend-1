/**
 * Contrato del repositorio de complejos de cine.
 *
 * Encapsula la consulta de cines y la validación de la relación con la ciudad.
 */
import Cinema, { CinemaCreationAttributes } from '../../models/cinema.model';

export interface ICinemaRepository {
  /** Crea un complejo de cine. */
  create(data: CinemaCreationAttributes): Promise<Cinema>;

  /** Busca un complejo de cine por su identificador. */
  findById(id: number): Promise<Cinema | null>;

  /** Busca complejos de cine por ciudad. */
  findByCity(city: string): Promise<Cinema[]>;
}
