// app/src/models/index.ts

import sequelize from "../config/database";
import User from "./user.model";
import Role from "./role.model";
import EmailVerificationToken from "./email-verification-model";
import Profile from "./profile.model";
import Membership from "./membership.model";
import MembershipLevel from "./membership-level.model";
import MembershipStatus from "./membership-status.model";
import BonusWallet from "./bonus-wallet.model";
import NotificationPreference from "./notification-preference.model";
import City from "./city.model";
import Cinema from "./cinema.model";
import Department from "./department.model";
import Country from "./country.model";
import Snack from "./snack.model";
import Cart from "./cart.model";
import CartItem from "./cart-item.model";
import Promotion from "./promotion.model";

// --- Associations ---

// Role - User
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// User - EmailVerificationToken
User.hasMany(EmailVerificationToken, { foreignKey: 'user_id', as: 'emailVerificationTokens' });
EmailVerificationToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - Profile
User.hasOne(Profile, { foreignKey: 'user_id', as: 'profile' });
Profile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - Membership
User.hasOne(Membership, { foreignKey: 'user_id', as: 'membership' });
Membership.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// MembershipLevel - Membership
MembershipLevel.hasMany(Membership, { foreignKey: 'level_id', as: 'memberships' });
Membership.belongsTo(MembershipLevel, { foreignKey: 'level_id', as: 'level' });

// MembershipStatus - Membership
MembershipStatus.hasMany(Membership, { foreignKey: 'status_id', as: 'memberships' });
Membership.belongsTo(MembershipStatus, { foreignKey: 'status_id', as: 'status' });

// User - BonusWallet
User.hasOne(BonusWallet, { foreignKey: 'user_id', as: 'bonusWallet' });
BonusWallet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - NotificationPreference
User.hasOne(NotificationPreference, { foreignKey: 'user_id', as: 'notificationPreference' });
NotificationPreference.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// City - Profile
City.hasMany(Profile, { foreignKey: 'city_id', as: 'profiles' });
Profile.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

// Cinema - Profile
Cinema.hasMany(Profile, { foreignKey: 'favorite_cinema_id', as: 'profiles' });
Profile.belongsTo(Cinema, { foreignKey: 'favorite_cinema_id', as: 'favoriteCinema' });

// Country - Department
Country.hasMany(Department, { foreignKey: 'country_id', as: 'departments' });
Department.belongsTo(Country, { foreignKey: 'country_id', as: 'country' });

// Department - City
Department.hasMany(City, { foreignKey: 'department_id', as: 'cities' });
City.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// --- Confitería (HU-012) ---

// User - Cart (un único carrito por usuario)
User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Cart - CartItem
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

// Snack - CartItem
Snack.hasMany(CartItem, { foreignKey: 'snack_id', as: 'cartItems' });
CartItem.belongsTo(Snack, { foreignKey: 'snack_id', as: 'snack' });

// Snack - Promotion
Snack.hasMany(Promotion, { foreignKey: 'snack_id', as: 'promotions' });
Promotion.belongsTo(Snack, { foreignKey: 'snack_id', as: 'snack' });

export {
  sequelize,
  User,
  Role,
  EmailVerificationToken,
  Profile,
  Membership,
  MembershipLevel,
  MembershipStatus,
  BonusWallet,
  NotificationPreference,
  City,
  Cinema,
  Department,
  Country,
  Snack,
  Cart,
  CartItem,
  Promotion
};