// app/src/repositories/interfaces/city.repository.interface.ts

import City from '../../models/city.model';

/**
 * Contrato del repositorio de ciudades.
 *
 * Encapsula la persistencia y la consulta de ciudades utilizadas por
 * la validación de ubicaciones y durante el registro del usuario.
 */
export interface ICityRepository {
  /** Busca una ciudad por su identificador. */
  findById(id: number): Promise<City | null>;

  /** Busca ciudades activas asociadas a un departamento. */
  findByDepartmentId(departmentId: number): Promise<City[]>;
}
