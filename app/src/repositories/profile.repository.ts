// app/src/repositories/profile.repository.ts

import { Transaction } from 'sequelize';
import Profile, { ProfileCreationAttributes } from '../models/profile.model.js';
import { IProfileRepository } from './interfaces/profile.repository.interface.js';

/**
 * Repositorio de Perfiles
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad Profile.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
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
  async findByUserId(userId: number): Promise<Profile | null> {
    return await Profile.findOne({ where: { userId } });
  }
}

export default new ProfileRepository();
