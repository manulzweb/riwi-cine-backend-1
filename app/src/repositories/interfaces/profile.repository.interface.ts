// app/src/repositories/interfaces/profile.repository.interface.ts

/**
 * Contrato del repositorio de perfiles.
 *
 * Encapsula la persistencia de los datos del perfil del usuario.
 */
import Profile, { ProfileCreationAttributes } from '../../models/profile.model.js';

export interface IProfileRepository {
  /** Crea el perfil del usuario. */
  create(data: ProfileCreationAttributes): Promise<Profile>;

  /** Busca el perfil asociado a un usuario. */
  findByUserId(userId: number): Promise<Profile | null>;
}
