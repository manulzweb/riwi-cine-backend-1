// app/src/repositories/profile.repository.ts

import { Transaction } from 'sequelize';
import Profile, { ProfileCreationAttributes } from '../models/profile.model.js';
import { IProfileRepository } from './interfaces/profile.repository.interface.js';

/**
 * Repositorio de Perfiles
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad Profile.
 */
class ProfileRepository implements IProfileRepository {
  /**
   * Crea un nuevo perfil.
   */
  async create(data: ProfileCreationAttributes, transaction?: Transaction): Promise<Profile> {
    return await Profile.create(data, { transaction });
  }

  /**
   * Busca el perfil asociado a un usuario.
   */
  async findByUserId(userId: number, transaction?: Transaction): Promise<Profile | null> {
    return await Profile.findOne({ where: { userId }, transaction });
  }

  /**
   * Actualiza un perfil por su identificador único.
   */
  async update(
    id: number,
    newData: Partial<ProfileCreationAttributes>,
    transaction?: Transaction,
  ): Promise<Profile | null> {
    const profile = await Profile.findByPk(id, { transaction });
    if (!profile) return null;

    return await profile.update(newData, { transaction });
  }

  /**
   * Actualiza el perfil asociado a un ID de usuario.
   */
  async updateByUserId(
    userId: number,
    newData: Partial<ProfileCreationAttributes>,
    transaction?: Transaction,
  ): Promise<Profile | null> {
    const profile = await Profile.findOne({ where: { userId }, transaction });
    if (!profile) return null;

    return await profile.update(newData, { transaction });
  }
}

export default ProfileRepository;
