// app/src/models/profile.model.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ProfileAttributes {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  birthDate: Date;
  gender: string | null;
  phone: string;
  cityId: number;
  favoriteCinemaId: number | null;
}

export type ProfileCreationAttributes = Optional<
  ProfileAttributes,
  'id' | 'gender' | 'favoriteCinemaId'
>;

class Profile
  extends Model<ProfileAttributes, ProfileCreationAttributes>
  implements ProfileAttributes
{
  declare public id: number;
  declare public userId: number;
  declare public firstName: string;
  declare public lastName: string;
  declare public documentType: string;
  declare public documentNumber: string;
  declare public birthDate: Date;
  declare public gender: string | null;
  declare public phone: string;
  declare public cityId: number;
  declare public favoriteCinemaId: number | null;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

Profile.init(
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
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name',
    },
    documentType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'document_type',
    },
    documentNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: 'document_number',
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'birth_date',
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'city_id',
    },
    favoriteCinemaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'favorite_cinema_id',
    },
  },
  {
    sequelize,
    modelName: 'Profile',
    tableName: 'profiles',
    timestamps: true,
    underscored: true,
  },
);

export default Profile;
