// app/src/repositories/interfaces/role.repository.interface.ts

/**
 * Contrato del repositorio de roles.
 *
 * Define las operaciones de persistencia para la entidad Role.
 */
import Role, { RoleCreationAttributes } from '../../models/role.model';

export interface IRoleRepository {
  /** Crea un rol. */
  create(data: RoleCreationAttributes): Promise<Role>;

  /** Busca un rol por su identificador. */
  findById(id: number): Promise<Role | null>;

  /** Busca un rol por su nombre. */
  findByName(name: string): Promise<Role | null>;
}
