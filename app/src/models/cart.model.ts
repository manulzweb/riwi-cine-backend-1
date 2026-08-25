// app/src/models/cart.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import { CartItem } from './cart-item.model';
import { CartTicket } from './cart-ticket.model';

/**
 * Modelo de Carrito de Compras
 * ----------------------------
 * Este archivo define el modelo `Cart` de Sequelize, que representa
 * la tabla `carts` en la base de datos (HU-011).
 *
 * Cada usuario puede tener un único carrito ACTIVO a la vez (RN-044).
 * El carrito es temporal y expira después de diez minutos sin actividad
 * (RN-046). Mientras exista un carrito activo, las sillas seleccionadas
 * permanecen bloqueadas mediante una reserva (RN-045).
 *
 * Estados posibles:
 *  - `ACTIVE`: carrito en uso, dentro del tiempo de expiración.
 *  - `EXPIRED`: carrito vencido por inactividad.
 *  - `CONVERTED`: carrito convertido en compra (pago realizado).
 */

export type CartStatus = 'ACTIVE' | 'EXPIRED' | 'CONVERTED';

/**
 * Atributos principales de la entidad `Cart`.
 */
export interface CartAttributes {
  id: number;
  userId: number;
  status: CartStatus;
  expiresAt: Date | null;
  giftcardAmount: number;
}

/**
 * Atributos opcionales a la hora de crear un nuevo `Cart`.
 * El `id` se omite porque es autoincrementable en la base de datos.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CartCreationAttributes extends Optional<
  CartAttributes,
  'id' | 'status' | 'expiresAt' | 'giftcardAmount'
> {}

/**
 * Clase que representa la entidad `Cart` mapeada en PostgreSQL.
 */
export class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  public id!: number;
  public userId!: number;
  public status!: CartStatus;
  public expiresAt!: Date | null;
  public giftcardAmount!: number;

  /** Ítems de confitería del carrito (asociación cargada mediante `include`). */
  public items?: CartItem[];

  /** Entradas del carrito (asociación cargada mediante `include`). */
  public tickets?: CartTicket[];

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
      field: 'user_id',
      references: {
        model: User,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'CONVERTED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expires_at',
    },
    giftcardAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'giftcard_amount',
    },
  },
  {
    sequelize,
    tableName: 'carts',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id'],
        where: { status: 'ACTIVE' },
        name: 'uniq_active_cart_per_user',
      },
    ],
  },
);

export default Cart;
