// app/src/models/user.model.ts

/**
 * Modelo de Usuario
 * -----------------
 * Este archivo define el modelo `User` de Sequelize, que representa la tabla `users` en la base de datos.
 *
 * Contiene:
 *  - Atributos del modelo (`UserAttributes`).
 *  - Atributos requeridos para la creación (`UserCreationAttributes`).
 *  - Definición del modelo con sus columnas y restricciones.
 *
 * Este modelo es utilizado por los servicios y controladores para realizar operaciones CRUD.
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Atributos principales de la entidad `User`.
 */
export interface UserAttributes {
  id: number;
  roleId: number;
  email: string;
  passwordHash: string;
  isActive: boolean;
  activatedAt: Date | null;
  emailVerifiedAt: Date | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  personalDataConsent: boolean;
  termsConsent: boolean;
  commercialConsent: boolean;
}

/**
 * Atributos utilizados para la creación de un nuevo usuario.
 *
 * Se utiliza `Optional` para indicar que `id` no es requerido al momento
 * de la creación, ya que se genera automáticamente por la base de datos.
 */
export type UserCreationAttributes = Optional<
  UserAttributes,
  | 'id'
  | 'roleId'
  | 'passwordHash'
  | 'isActive'
  | 'activatedAt'
  | 'emailVerifiedAt'
  | 'failedLoginAttempts'
  | 'lockedUntil'
  | 'lastLoginAt'
  | 'commercialConsent'
>;

/**
 * Clase que representa el modelo `User` en Sequelize.
 *
 * Implementa los atributos definidos en `UserAttributes` y `UserCreationAttributes`.
 */
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  /** Identificador único del usuario (clave primaria). */
  declare public id: number;

  /** Identificador del rol asignado. */
  declare public roleId: number;

  /** Dirección de correo electrónico única del usuario. */
  declare public email: string;

  /** Hash de la contraseña cifrada. */
  declare public passwordHash: string;

  /** Indica si el usuario ha sido activado. */
  declare public isActive: boolean;

  /** Fecha y hora en que la cuenta fue activada. */
  declare public activatedAt: Date | null;

  /** Fecha y hora en que el correo electrónico fue verificado. */
  declare public emailVerifiedAt: Date | null;

  /** Contador de intentos fallidos de inicio de sesión. */
  declare public failedLoginAttempts: number;

  /** Fecha y hora hasta la cual la cuenta está bloqueada. */
  declare public lockedUntil: Date | null;

  /** Fecha y hora del último inicio de sesión. */
  declare public lastLoginAt: Date | null;

  /** Indica si el usuario dio consentimiento para el tratamiento de datos personales. */
  declare public personalDataConsent: boolean;

  /** Indica si el usuario aceptó los términos y condiciones. */
  declare public termsConsent: boolean;

  /** Indica si el usuario aceptó recibir comunicaciones comerciales. */
  declare public commercialConsent: boolean;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

/**
 * Inicialización del modelo `User` con la configuración de Sequelize.
 *
 * - `id`: Entero autoincremental, clave primaria.
 * - `name`: Nombre obligatorio con máximo 100 caracteres.
 * - `email`: Correo electrónico único y obligatorio con máximo 100 caracteres.
 * - `password`: Contraseña opcional con máximo 100 caracteres.
 */
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'role_id',
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'password_hash',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_active',
    },
    activatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'activated_at',
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'email_verified_at',
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'failed_login_attempts',
    },
    lockedUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'locked_until',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at',
    },
    personalDataConsent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'personal_data_consent',
    },
    termsConsent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'terms_consent',
    },
    commercialConsent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'commercial_consent',
    },
  },
  {
    sequelize,
    modelName: 'User', // Nombre del modelo en Sequelize
    tableName: 'users', // Nombre de la tabla en la base de datos
    timestamps: true, // Incluye createdAt y updatedAt
    underscored: true,
  },
);

export default User;
