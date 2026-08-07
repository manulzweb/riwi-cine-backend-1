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
  name: string;
  email: string;
  password?: string;
  password_hash?: string;
  role_id?: number;
  email_verified_at: Date | null;
  failed_login_attempts: number;
  locked_until: Date | null;
  last_login_at: Date | null;
}

/**
 * Atributos utilizados para la creación de un nuevo usuario.
 * 
 * Se utiliza `Optional` para indicar que `id` no es requerido al momento
 * de la creación, ya que se genera automáticamente por la base de datos.
 */
export interface UserCreationAttributes extends Optional<
  UserAttributes,
  "id"
> {}

/**
 * Clase que representa el modelo `User` en Sequelize.
 * 
 * Implementa los atributos definidos en `UserAttributes` y `UserCreationAttributes`.
 */
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  /** Identificador único del usuario (clave primaria). */
  public id!: number;

  /** Nombre completo del usuario. */
  public name!: string;

  /** Dirección de correo electrónico única del usuario. */
  public email!: string;

  public password_hash!: string;
  public role_id!: number;
  public email_verified_at!: Date | null;
  public failed_login_attempts!: number;
  public locked_until!: Date | null;
  public last_login_at!: Date | null;
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User", // Nombre del modelo en Sequelize
    tableName: "users", // Nombre de la tabla en la base de datos
    timestamps: true, // Incluye createdAt y updatedAt
  },
);

export default User;