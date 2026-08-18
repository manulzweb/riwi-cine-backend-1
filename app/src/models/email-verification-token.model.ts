import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Atributos principales de la entidad `EmailVerificationToken`.
 *
 * Representa la información almacenada en la tabla
 * `email_verification_tokens`.
 */
export interface EmailVerificationTokenAttributes {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}

/**
 * Atributos utilizados para la creación de un nuevo token
 * de verificación.
 *
 * El identificador `id` es generado automáticamente por la base
 * de datos y `usedAt` puede permanecer como null hasta que el token
 * sea utilizado.
 */
export type EmailVerificationTokenCreationAttributes = Optional<
  EmailVerificationTokenAttributes,
  'id' | 'usedAt'
>;

/**
 * Modelo de Token de Verificación de Correo
 * ------------------------------------------
 * Representa la tabla `email_verification_tokens` en la base de datos.
 *
 * Responsabilidades:
 * - Definir los atributos de la entidad.
 * - Definir los atributos permitidos durante la creación.
 * - Configurar las columnas de la tabla.
 * - Definir restricciones y valores por defecto.
 *
 * El modelo no contiene lógica relacionada con:
 * - Generación de tokens.
 * - Hashing.
 * - Verificación criptográfica.
 * - Envío de correos.
 *
 * Estas responsabilidades pertenecen a las capas correspondientes.
 */
class EmailVerificationToken
  extends Model<EmailVerificationTokenAttributes, EmailVerificationTokenCreationAttributes>
  implements EmailVerificationTokenAttributes
{
  /** Identificador único del token. */
  public id!: number;

  /** Identificador del usuario propietario del token. */
  public userId!: number;

  /**
   * Hash del token de verificación.
   *
   * El token original nunca debe almacenarse en texto plano.
   */
  public tokenHash!: string;

  /** Fecha y hora en la que el token deja de ser válido. */
  public expiresAt!: Date;

  /**
   * Fecha y hora en la que el token fue utilizado.
   *
   * `null` indica que el token todavía no ha sido utilizado.
   */
  public usedAt!: Date | null;

  /** Fecha de creación del registro. */
  public readonly createdAt!: Date;

  /** Fecha de última actualización del registro. */
  public readonly updatedAt!: Date;
}

/**
 * Inicialización del modelo `EmailVerificationToken`
 * con la configuración de Sequelize.
 */
EmailVerificationToken.init(
  {
    /**
     * Identificador único del token.
     */
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    /**
     * Identificador del usuario propietario del token.
     */
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },

    /**
     * Hash del token utilizado para verificar el correo.
     *
     * Por seguridad, únicamente se almacena el hash y nunca
     * el token original.
     */
    tokenHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'token_hash',
    },

    /**
     * Fecha y hora de expiración del token.
     */
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },

    /**
     * Fecha y hora en la que el token fue utilizado.
     *
     * Mientras sea `null`, el token no ha sido utilizado.
     */
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: 'used_at',
    },
  },
  {
    sequelize,
    modelName: 'EmailVerificationToken',
    tableName: 'email_verification_tokens',
    timestamps: true,
    underscored: true,
  },
);

export default EmailVerificationToken;
