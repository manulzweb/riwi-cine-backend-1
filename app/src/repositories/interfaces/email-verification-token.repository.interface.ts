import { Transaction } from 'sequelize';
import EmailVerificationToken, {
  EmailVerificationTokenCreationAttributes,
} from '../../models/email-verification-token.model';
/**
 * Contrato del Repositorio de Tokens de Verificación
 * --------------------------------------------------
 * Define las operaciones de persistencia disponibles para la entidad
 * EmailVerificationToken.
 *
 * Cualquier implementación del repositorio deberá cumplir con este
 * contrato y será responsable de interactuar con la capa de persistencia.
 *
 * El repositorio no contiene lógica relacionada con la generación,
 * hashing o validación criptográfica de tokens.
 */
export interface IEmailVerificationTokenRepository {
  /**
   * Crea un nuevo token de verificación.
   *
   * @param data Datos necesarios para persistir el token.
   *
   * @returns El token de verificación creado.
   */
  create(
    data: EmailVerificationTokenCreationAttributes,
    transaction?: Transaction,
  ): Promise<EmailVerificationToken>;

  /**
   * Obtiene el token de verificación más reciente de un usuario
   * que todavía no haya sido utilizado.
   *
   * @param userId Identificador del usuario.
   *
   * @returns El token más reciente o null si no existe.
   */
  findLatestUnusedByUserId(userId: number): Promise<EmailVerificationToken | null>;

  /**
   * Marca un token de verificación como utilizado.
   *
   * @param tokenId Identificador del token.
   */
  markAsUsed(tokenId: number): Promise<void>;

  /**
   * Invalida todos los tokens de verificación no utilizados
   * pertenecientes a un usuario.
   *
   * Esto permite garantizar que únicamente exista un token
   * de activación válido para el usuario.
   *
   * @param userId Identificador del usuario.
   */
  invalidateUnusedByUserId(userId: number): Promise<void>;
}
