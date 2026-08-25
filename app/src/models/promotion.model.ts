// app/src/models/promotion.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Modelo de Promoción
 * -------------------
 * Este archivo define el modelo `Promotion` de Sequelize, que representa
 * la tabla `promotions` en la base de datos.
 *
 * Las promociones permiten aplicar descuentos temporales a un producto de
 * confitería (`Snack`). Cada promoción define:
 *  - Tipo de descuento (`percent` = porcentaje, `fixed` = valor en pesos).
 *  - Valor del descuento.
 *  - Rango de fechas de vigencia (startDate / endDate).
 *  - Estado activo (`isActive`).
 *
 * Al agregar un producto al carrito se respeta la promoción vigente más
 * favorable para el usuario (HU-012).
 */

/**
 * Atributos principales de la entidad `Promotion`.
 */
export interface PromotionAttributes {
  id: number;
  snackId: number;
  name: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

/**
 * Atributos opcionales a la hora de crear una nueva `Promotion`.
 * El `id` se omite porque es autoincrementable en la base de datos.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PromotionCreationAttributes extends Optional<
  PromotionAttributes,
  'id' | 'isActive'
> {}

/**
 * Clase que representa la entidad `Promotion` mapeada en PostgreSQL.
 */
export class Promotion
  extends Model<PromotionAttributes, PromotionCreationAttributes>
  implements PromotionAttributes
{
  public id!: number;
  public snackId!: number;
  public name!: string;
  public discountType!: 'percent' | 'fixed';
  public discountValue!: number;
  public startDate!: Date;
  public endDate!: Date;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Promotion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    snackId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'snack_id',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    discountType: {
      type: DataTypes.ENUM('percent', 'fixed'),
      allowNull: false,
      field: 'discount_type',
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'discount_value',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_date',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    tableName: 'promotions',
    timestamps: true,
    underscored: true,
  },
);

export default Promotion;
