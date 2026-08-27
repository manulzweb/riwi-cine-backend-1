// app/src/models/cart-ticket.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import Cart from './cart.model.js';
import CinemaFunction from './function.model.js';
import Reservation from './reservation.model.js';

/**
 * Modelo de Entrada de Carrito
 * ----------------------------
 * Este archivo define el modelo `CartTicket` de Sequelize, que representa
 * la tabla `cart_tickets` en la base de datos (HU-011).
 *
 * Cada registro vincula un carrito (`Cart`) con una reserva de sillas
 * (`Reservation`) para una función (`CinemaFunction`). Las sillas concretas
 * se obtienen a través de la reserva (`ReservationSeat`), lo que permite
 * mantener el bloqueo de sillas mientras el carrito esté activo (RN-045).
 *
 * Los valores monetarios se guardan como snapshot al momento de agregar la
 * entrada, de modo que el resumen del carrito sea estable aunque cambien
 * precios posteriores.
 */

/**
 * Atributos principales de la entidad `CartTicket`.
 */
export interface CartTicketAttributes {
  id: number;
  cartId: number;
  functionId: number;
  reservationId: number;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  total: number;
}

/**
 * Atributos opcionales a la hora de crear un nuevo `CartTicket`.
 * El `id` se omite porque es autoincrementable en la base de datos.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CartTicketCreationAttributes extends Optional<
  CartTicketAttributes,
  'id' | 'discountAmount'
> {}

/**
 * Clase que representa la entidad `CartTicket` mapeada en PostgreSQL.
 */
export class CartTicket
  extends Model<CartTicketAttributes, CartTicketCreationAttributes>
  implements CartTicketAttributes
{
  public id!: number;
  public cartId!: number;
  public functionId!: number;
  public reservationId!: number;
  public quantity!: number;
  public unitPrice!: number;
  public discountAmount!: number;
  public total!: number;

  /** Función asociada (asociación cargada mediante `include`). */
  public function?: CinemaFunction;

  /** Reserva asociada con sus sillas (asociación cargada mediante `include`). */
  public reservation?: Reservation;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CartTicket.init(
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
      references: {
        model: Cart,
        key: 'id',
      },
    },
    functionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'function_id',
      references: {
        model: CinemaFunction,
        key: 'id',
      },
    },
    reservationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'reservation_id',
      references: {
        model: Reservation,
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'unit_price',
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'discount_amount',
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'cart_tickets',
    timestamps: true,
    underscored: true,
  },
);

export default CartTicket;
