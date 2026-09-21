// app/src/repositories/interfaces/login-audit.repository.interface.ts

import { Transaction } from 'sequelize';
import LoginAudit, { LoginAuditCreationAttributes } from '../../models/login-audit.model.js';

export interface ILoginAuditRepository {
  create(data: LoginAuditCreationAttributes, transaction?: Transaction): Promise<LoginAudit>;
}
