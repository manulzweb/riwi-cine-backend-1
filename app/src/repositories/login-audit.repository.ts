// app/src/repositories/login-audit.repository.ts

import { Transaction } from 'sequelize';
import LoginAudit, { LoginAuditCreationAttributes } from '../models/login-audit.model.js';

/**
 * Repositorio de Auditoría de Inicios de Sesión
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad LoginAudit.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */

class LoginAuditRepository {
  /**
   * Registra un nuevo intento de inicio de sesión en la auditoría.
   */
  async create(data: LoginAuditCreationAttributes, transaction?: Transaction): Promise<LoginAudit> {
    return await LoginAudit.create(data, { transaction });
  }
}

export const loginAuditRepository = new LoginAuditRepository();
export default loginAuditRepository;
