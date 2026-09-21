// app/src/services/interfaces/profile.service.interface.ts

import { UpdateProfileRequestDto } from '../../dto/request/update-profile.dto.js';
import { ProfileDetailResponseDto } from '../../dto/response/profile-detail.dto.js';

export interface IProfileService {
  /** Obtiene el perfil completo del usuario autenticado con membresía y preferencias. */
  getProfile(userId: number): Promise<ProfileDetailResponseDto>;

  /** Actualiza la información del perfil y preferencias del usuario. */
  updateProfile(userId: number, dto: UpdateProfileRequestDto): Promise<ProfileDetailResponseDto>;
}
