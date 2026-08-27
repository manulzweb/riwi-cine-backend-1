// app/src/models/purchase-history.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface PurchaseHistoryAttributes {
  id: number;
  userId: number;
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseAt: Date | null;
}

export type PurchaseHistoryCreationAttributes = Optional<
  PurchaseHistoryAttributes,
  'id' | 'totalPurchases' | 'totalSpent' | 'lastPurchaseAt'
>;

/**
 * Historial de compras del usuario.
 *
 * Se crea vacío junto con la cuenta durante el registro y actúa como
 * registro agregado de la actividad de compras. El detalle de cada
 * compra corresponderá a la funcionalidad de pagos de futuras fases.
 */
class PurchaseHistory
  extends Model<PurchaseHistoryAttributes, PurchaseHistoryCreationAttributes>
  implements PurchaseHistoryAttributes
{
  public id!: number;
  public userId!: number;
  public totalPurchases!: number;
  public totalSpent!: number;
  public lastPurchaseAt!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PurchaseHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      unique: true,
    },
    totalPurchases: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_purchases',
    },
    totalSpent: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'total_spent',
    },
    lastPurchaseAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_purchase_at',
    },
  },
  {
    sequelize,
    modelName: 'PurchaseHistory',
    tableName: 'purchase_histories',
    timestamps: true,
    underscored: true,
  },
);

export default PurchaseHistory;
