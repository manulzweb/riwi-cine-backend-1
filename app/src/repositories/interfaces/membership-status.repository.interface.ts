// app/src/repositories/interfaces/membership-status.repository.interface.ts

/**
 * Contrato del repositorio de estados de membresía.
 *
 * Define las operaciones de persistencia para la entidad MembershipStatus.
 */
import MembershipStatus, {
  MembershipStatusCreationAttributes,
} from '../../models/membership-status.model';

export interface IMembershipStatusRepository {
  /** Crea un estado de membresía. */
  create(data: MembershipStatusCreationAttributes): Promise<MembershipStatus>;

  /** Busca un estado por su identificador. */
  findById(id: number): Promise<MembershipStatus | null>;

  /** Busca un estado por su nombre. */
  findByName(name: string): Promise<MembershipStatus | null>;
}
