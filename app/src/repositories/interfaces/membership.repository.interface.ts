// app/src/repositories/interfaces/membership.repository.interface.ts

/**
 * Contrato del repositorio de membresías.
 *
 * Define las operaciones de persistencia para la entidad Membership.
 */
import Membership, { MembershipCreationAttributes } from '../../models/membership.model';

export interface IMembershipRepository {
  /** Crea una membresía. */
  create(data: MembershipCreationAttributes): Promise<Membership>;

  /** Busca una membresía por código. */
  findByCode(code: string): Promise<Membership | null>;

  /** Busca la membresía asociada a un usuario. */
  findByUserId(userId: number): Promise<Membership | null>;
}
