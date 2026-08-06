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
}

/**
 * Atributos utilizados para la creación de un nuevo usuario.
 *
 * Se utiliza `Optional` para indicar que `id` no es requerido al momento
 * de la creación, ya que se genera automáticamente por la base de datos.
 */
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'roleId' | 'activatedAt' > {}

/**
 * Clase que representa el modelo `User` en Sequelize.
 *
 * Implementa los atributos definidos en `UserAttributes` y `UserCreationAttributes`.
 */
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  /** Identificador único del usuario (clave primaria). */
  public id!: number;

  /** Nombre completo del usuario. */
  public roleId!: number;

  /** Dirección de correo electrónico única del usuario. */
  public email!: string;

  public passwordHash!: string;

  public isActive!: boolean;

  public activatedAt!: Date | null;

  public readonly createdAt!: Date;

  public readonly updateAt!: Date;
  
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
      type: DataTypes.STRING(100),
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
      field: 'is_active',
    },
    activatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'activated_at',
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
