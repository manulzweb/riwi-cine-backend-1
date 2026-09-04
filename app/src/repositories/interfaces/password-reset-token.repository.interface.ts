// app/src/repositories/interfaces/password-reset-token.repository.interface.ts

import { Transaction } from 'sequelize';
import {
  PasswordResetTokenCreationAttributes,
  PasswordResetTokenInstance,
} from '../../models/password-reset-token.model.js';

export interface IPasswordResetTokenRepository {
  create(
    data: PasswordResetTokenCreationAttributes,
    transaction?: Transaction,
  ): Promise<PasswordResetTokenInstance>;
  findLatestUnusedByUserId(
    userId: number,
    transaction?: Transaction,
  ): Promise<PasswordResetTokenInstance | null>;
  markAsUsed(id: number, transaction?: Transaction): Promise<void>;
}
