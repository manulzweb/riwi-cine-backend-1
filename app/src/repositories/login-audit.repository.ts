import { Transaction } from 'sequelize';
import LoginAudit, { LoginAuditCreationAttributes } from '../models/login-audit.model';

class LoginAuditRepository {
  async create(data: LoginAuditCreationAttributes, transaction?: Transaction): Promise<LoginAudit> {
    return await LoginAudit.create(data, { transaction });
  }
}

export const loginAuditRepository = new LoginAuditRepository();
export default loginAuditRepository;
