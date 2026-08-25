// app/src/repositories/interfaces/membership-level.repository.interface.ts

/**
 * Contrato del repositorio de niveles de membresía.
 *
 * Define las operaciones de persistencia para la entidad MembershipLevel.
 */
import MembershipLevel, {
  MembershipLevelCreationAttributes,
} from '../../models/membership-level.model';

export interface IMembershipLevelRepository {
  /** Crea un nivel de membresía. */
  create(data: MembershipLevelCreationAttributes): Promise<MembershipLevel>;

  /** Busca un nivel por su identificador. */
  findById(id: number): Promise<MembershipLevel | null>;

  /** Busca un nivel por su nombre. */
  findByName(name: string): Promise<MembershipLevel | null>;
}
