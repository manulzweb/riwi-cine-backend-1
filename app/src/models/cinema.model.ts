// app/src/models/cinema.model.ts

/**
 * Modelo de Complejo de Cine
 * --------------------------
 * Este archivo define el modelo `Cinema` de Sequelize, que representa
 * la tabla `cinemas` en la base de datos.
 *
 * Contiene:
 *  - Atributos del modelo (`CinemaAttributes`).
 *  - Atributos requeridos para la creación (`CinemaCreationAttributes`).
 *  - Definición del modelo con sus columnas y restricciones.
 *
 * Este modelo es utilizado por los servicios y controladores para
 * consultar los complejos de cine disponibles por ciudad.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

/**
 * Atributos principales de la entidad `Cinema`.
 */
export interface CinemaAttributes {
  id: number;
  name: string;
  city: string;
  address: string;
  isActive: boolean;
}

/**
 * Atributos utilizados para la creación de un nuevo complejo de cine.
 *
 * Se utiliza `Optional` para indicar que `id` no es requerido al momento
 * de la creación, ya que se genera automáticamente por la base de datos.
 */
export interface CinemaCreationAttributes extends Optional<
  CinemaAttributes,
  "id"
> {}

/**
 * Clase que representa el modelo `Cinema` en Sequelize.
 */
class Cinema
  extends Model<CinemaAttributes, CinemaCreationAttributes>
  implements CinemaAttributes
{
  /** Identificador único del complejo de cine (clave primaria). */
  public id!: number;

  /** Nombre del complejo de cine. */
  public name!: string;

  /** Ciudad donde se encuentra el complejo. */
  public city!: string;

  /** Dirección física del complejo. */
  public address!: string;

  /** Indica si el complejo está activo. */
  public isActive!: boolean;
}

/**
 * Inicialización del modelo `Cinema` con la configuración de Sequelize.
 */
Cinema.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(300),
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
    modelName: "Cinema", // Nombre del modelo en Sequelize
    tableName: "cinemas", // Nombre de la tabla en la base de datos
    timestamps: true, // Incluye createdAt y updatedAt
  },
);

export default Cinema;