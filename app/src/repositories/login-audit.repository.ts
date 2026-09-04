// app/src/repositories/login-audit.repository.ts

import { Transaction } from 'sequelize';
import LoginAudit, { LoginAuditCreationAttributes } from '../models/login-audit.model.js';
import { ILoginAuditRepository } from './interfaces/login-audit.repository.interface.js';

/**
 * Repositorio de Auditoría de Inicios de Sesión
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad LoginAudit.
 */
export class LoginAuditRepository implements ILoginAuditRepository {
  async create(data: LoginAuditCreationAttributes, transaction?: Transaction): Promise<LoginAudit> {
    return await LoginAudit.create(data, { transaction });
  }
}

export default LoginAuditRepository;
