// app/src/models/cart-item.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Snack } from './snack.model';

/**
 * Modelo de Ítem de Carrito
 * -------------------------
 * Este archivo define el modelo `CartItem` de Sequelize, que representa
 * la tabla `cart_items` en la base de datos.
 *
 * Cada ítem vincula un producto de confitería (`Snack`) con un carrito (`Cart`)
 * y guarda la cantidad solicitada junto con el precio unitario efectivo
 * (snapshot al momento de agregarlo, respetando promociones y descuentos).
 */

/**
 * Atributos principales de la entidad `CartItem`.
 */
export interface CartItemAttributes {
  id: number;
  cartId: number;
  snackId: number;
  quantity: number;
  unitPrice: number;
}

/**
 * Atributos opcionales a la hora de crear un nuevo `CartItem`.
 * El `id` se omite porque es autoincrementable en la base de datos.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CartItemCreationAttributes extends Optional<CartItemAttributes, 'id'> {}

/**
 * Clase que representa la entidad `CartItem` mapeada en PostgreSQL.
 */
export class CartItem
  extends Model<CartItemAttributes, CartItemCreationAttributes>
  implements CartItemAttributes
{
  declare public id: number;
  declare public cartId: number;
  declare public snackId: number;
  declare public quantity: number;
  declare public unitPrice: number;

  /** Producto de confitería asociado (asociación cargada mediante `include`). */
  declare public snack?: Snack;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

CartItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'cart_id',
    },
    snackId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'snack_id',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // Las cantidades negativas se rechazan en el servicio (RN-012)
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false, // Precio efectivo con descuentos/promociones aplicados
      field: 'unit_price',
    },
  },
  {
    sequelize,
    tableName: 'cart_items',
    timestamps: true,
    underscored: true,
  },
);

export default CartItem;
