// app/src/models/cart.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { CartItem } from './cart-item.model';

/**
 * Modelo de Carrito de Compras
 * ----------------------------
 * Este archivo define el modelo `Cart` de Sequelize, que representa
 * la tabla `carts` en la base de datos.
 *
 * Cada usuario registrado posee un único carrito (relación 1 a 1 con `User`).
 * Los productos agregados se almacenan como `CartItem`, validando siempre
 * la disponibilidad de inventario y las promociones vigentes (HU-012).
 */

/**
 * Atributos principales de la entidad `Cart`.
 */
export interface CartAttributes {
  id: number;
  userId: number;
}

/**
 * Atributos opcionales a la hora de crear un nuevo `Cart`.
 * El `id` se omite porque es autoincrementable en la base de datos.
 */
export interface CartCreationAttributes extends Optional<CartAttributes, 'id'> {}

/**
 * Clase que representa la entidad `Cart` mapeada en PostgreSQL.
 */
export class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  public id!: number;
  public userId!: number;

  /** Ítems del carrito (asociación cargada mediante `include`). */
  public items?: CartItem[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Un único carrito por usuario
      field: 'user_id',
    },
  },
  {
    sequelize,
    tableName: 'carts',
    timestamps: true,
    underscored: true,
  }
);

export default Cart;