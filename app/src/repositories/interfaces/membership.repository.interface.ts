// app/src/repositories/interfaces/membership.repository.interface.ts

import { Transaction } from 'sequelize';
import Membership, { MembershipCreationAttributes } from '../../models/membership.model.js';

export interface IMembershipRepository {
  /** Crea una membresía. */
  create(data: MembershipCreationAttributes, transaction?: Transaction): Promise<Membership>;

  /** Busca una membresía por código. */
  findByCode(code: string, transaction?: Transaction): Promise<Membership | null>;

  /** Busca la membresía asociada a un usuario. */
  findByUserId(userId: number, transaction?: Transaction): Promise<Membership | null>;

  /** Busca la membresía con sus relaciones de nivel y estado. */
  findByUserIdWithDetails(userId: number, transaction?: Transaction): Promise<Membership | null>;
}
