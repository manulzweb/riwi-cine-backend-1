import { Transaction } from 'sequelize';
import Role, { RoleCreationAttributes } from '../models/role.model';
import { IRoleRepository } from './interfaces/role.repository.interface';

class RoleRepository implements IRoleRepository {
  async create(data: RoleCreationAttributes, transaction?: Transaction): Promise<Role> {
    return await Role.create(data, { transaction });
  }

  async findById(id: number): Promise<Role | null> {
    return await Role.findByPk(id);
  }

  async findByName(name: string): Promise<Role | null> {
    return await Role.findOne({ where: { name } });
  }
}

export default new RoleRepository();
