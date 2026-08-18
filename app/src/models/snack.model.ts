// app/src/models/snack.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

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
}

/**
 * Atributos opcionales a la hora de crear un nuevo `Snack`.
 * El `id` se omite porque es autoincrementable en la base de datos.
 */
export interface SnackCreationAttributes extends Optional<SnackAttributes, 'id'> {}

/**
 * Clase que representa la entidad `Snack` mapeada en PostgreSQL.
 */
export class Snack extends Model<SnackAttributes, SnackCreationAttributes> implements SnackAttributes {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public price!: number;
  public category!: string;
  public stock!: number;
  public imageUrl!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
  },
  {
    sequelize,
    tableName: 'snacks',
    timestamps: true,
  }
);

export default Snack;
