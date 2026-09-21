// app/src/models/snack.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Modelo de Confitería
 *
 * --------------------------------------------
 * Este archivo define el modelo `Snack` de Sequelize, que representa
 * la tabla `snacks` en la base de datos.
 *
 * Contiene:
 *  - Atributos del modelo (`SnackAttributes`).
 *  - Atributos requeridos para la creación (`SnackCreationAttributes`).
 *  - Definición del modelo con sus columnas y restricciones.
 *
 * Cada producto o combo de confitería puede ser añadido al carrito de compras
 * por los usuarios, validando siempre la disponibilidad de inventario.
 *
 * Adicionalmente, cada producto maneja un descuento base (`discountPercentage`)
 * que representa la promoción vigente del producto. Las promociones temporales
 * se gestionan a través del modelo `Promotion` (ver promotion.model.ts).
 */

/**
 * Atributos principales de la entidad `Snack`.
 */
export interface SnackAttributes {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock: number;
  imageUrl: string | null;
  discountPercentage: number;
}

/**
 * Atributos opcionales a la hora de crear un nuevo `Snack`.
 * El `id` se omite porque es autoincrementable en la base de datos.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SnackCreationAttributes extends Optional<
  SnackAttributes,
  'id' | 'discountPercentage'
> {}

/**
 * Clase que representa la entidad `Snack` mapeada en PostgreSQL.
 */
export class Snack
  extends Model<SnackAttributes, SnackCreationAttributes>
  implements SnackAttributes
{
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare price: number;
  declare category: string;
  declare stock: number;
  declare imageUrl: string | null;
  declare discountPercentage: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Snack.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false, // Controla las secciones: Crispetas, Combos, Bebidas, etc.
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Regla de Negocio RN-049: Control estricto de inventario
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    discountPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0, // Promoción base vigente del producto (0 = sin descuento)
    },
  },
  {
    sequelize,
    tableName: 'snacks',
    timestamps: true,
  },
);

export default Snack;
