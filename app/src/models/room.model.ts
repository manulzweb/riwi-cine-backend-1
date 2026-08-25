// app/src/models/room.model.ts

/**
 * Modelo de Sala
 * --------------
 * Este archivo define el modelo `Room` de Sequelize, que representa
 * la tabla `rooms` en la base de datos.
 *
 * Contiene:
 *  - Atributos del modelo (`RoomAttributes`).
 *  - Atributos requeridos para la creación (`RoomCreationAttributes`).
 *  - Definición del modelo con sus columnas y restricciones.
 *
 * Cada sala pertenece a un complejo de cine (`Cinema`) y tiene un formato
 * específico (2D, 3D, IMAX, VIP).
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Cinema from './cinema.model';

/**
 * Atributos principales de la entidad `Room`.
 */
export interface RoomAttributes {
  id: number;
  name: string;
  format: string;
  capacity: number;
  cinemaId: number;
  isActive: boolean;
}

/**
 * Atributos utilizados para la creación de una nueva sala.
 *
 * Se utiliza `Optional` para indicar que `id` no es requerido al momento
 * de la creación, ya que se genera automáticamente por la base de datos.
 */
export type RoomCreationAttributes = Optional<RoomAttributes, 'id'>;

/**
 * Clase que representa el modelo `Room` en Sequelize.
 */
class Room extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
  /** Identificador único de la sala (clave primaria). */
  declare public id: number;

  /** Nombre de la sala (ej. Sala 1, Sala IMAX). */
  declare public name: string;

  /** Formato de la sala (2D, 3D, IMAX, VIP). */
  declare public format: string;

  /** Capacidad máxima de personas. */
  declare public capacity: number;

  /** Identificador del complejo de cine al que pertenece la sala. */
  declare public cinemaId: number;

  /** Indica si la sala está activa. */
  declare public isActive: boolean;
}

/**
 * Inicialización del modelo `Room` con la configuración de Sequelize.
 */
Room.init(
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
    format: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cinemaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Room', // Nombre del modelo en Sequelize
    tableName: 'rooms', // Nombre de la tabla en la base de datos
    timestamps: true, // Incluye createdAt y updatedAt
  },
);

// Una sala pertenece a un complejo de cine
Room.belongsTo(Cinema, { foreignKey: 'cinemaId', as: 'cinema' });
Cinema.hasMany(Room, { foreignKey: 'cinemaId', as: 'rooms' });

export default Room;
