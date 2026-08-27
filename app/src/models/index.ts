// app/src/models/index.ts

import sequelize from '../config/database.js';
import User from './user.model.js';
import Role from './role.model.js';
import EmailVerificationToken from './email-verification-token.model.js';
import Profile from './profile.model.js';
import Room from './room.model.js';
import CinemaFunction from './function.model.js';
import SeatType from './seat-type.model.js';
import Seat from './seat.model.js';
import Reservation from './reservation.model.js';
import ReservationSeat from './reservation-seat.model.js';
import Membership from './membership.model.js';
import MembershipLevel from './membership-level.model.js';
import MembershipStatus from './membership-status.model.js';
import BonusWallet from './bonus-wallet.model.js';
import PurchaseHistory from './purchase-history.model.js';
import NotificationPreference from './notification-preference.model.js';
import UpcomingMovieNotification from './upcoming-movie-notification.model.js';
import City from './city.model.js';
import Cinema from './cinema.model.js';
import Department from './department.model.js';
import Country from './country.model.js';
import Movie from './movie.model.js';
import RefreshToken from './refresh-token.model.js';
import LoginAudit from './login-audit.model.js';
import PasswordResetToken from './password-reset-token.model.js';
import Cart from './cart.model.js';
import { CartItem } from './cart-item.model.js';
import { CartTicket } from './cart-ticket.model.js';
import Snack from './snack.model.js';
import Promotion from './promotion.model.js';

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

// User - PurchaseHistory
User.hasOne(PurchaseHistory, { foreignKey: 'user_id', as: 'purchaseHistory' });
PurchaseHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - NotificationPreference
User.hasOne(NotificationPreference, { foreignKey: 'user_id', as: 'notificationPreference' });
NotificationPreference.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - UpcomingMovieNotification
User.hasMany(UpcomingMovieNotification, {
  foreignKey: 'user_id',
  as: 'upcomingMovieNotifications',
});
UpcomingMovieNotification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Movie - UpcomingMovieNotification
Movie.hasMany(UpcomingMovieNotification, {
  foreignKey: 'movie_id',
  as: 'upcomingMovieNotifications',
});
UpcomingMovieNotification.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

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

// City - Cinema
City.hasMany(Cinema, { foreignKey: 'city_id', as: 'cinemas' });
Cinema.belongsTo(City, { foreignKey: 'city_id', as: 'cityRef' });

// User - RefreshToken
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - LoginAudit
User.hasMany(LoginAudit, { foreignKey: 'user_id', as: 'loginAudits' });
LoginAudit.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - PasswordResetToken
User.hasMany(PasswordResetToken, { foreignKey: 'user_id', as: 'passwordResetTokens' });
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Room - Seat
Room.hasMany(Seat, {
  foreignKey: 'roomId',
  as: 'seats',
});

Seat.belongsTo(Room, {
  foreignKey: 'roomId',
  as: 'room',
});

// SeatType - Seat
SeatType.hasMany(Seat, {
  foreignKey: 'seatTypeId',
  as: 'seats',
});

Seat.belongsTo(SeatType, {
  foreignKey: 'seatTypeId',
  as: 'seatType',
});

// User - Reservation
User.hasMany(Reservation, {
  foreignKey: 'userId',
  as: 'reservations',
});

Reservation.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Function - Reservation
CinemaFunction.hasMany(Reservation, {
  foreignKey: 'functionId',
  as: 'reservations',
});

Reservation.belongsTo(CinemaFunction, {
  foreignKey: 'functionId',
  as: 'function',
});

// Reservation - ReservationSeat
Reservation.hasMany(ReservationSeat, {
  foreignKey: 'reservationId',
  as: 'reservationSeats',
});

ReservationSeat.belongsTo(Reservation, {
  foreignKey: 'reservationId',
  as: 'reservation',
});

// Seat - ReservationSeat
Seat.hasMany(ReservationSeat, {
  foreignKey: 'seatId',
  as: 'reservationSeats',
});

ReservationSeat.belongsTo(Seat, {
  foreignKey: 'seatId',
  as: 'seat',
});

// Movie - CinemaFunction
Movie.hasMany(CinemaFunction, {
  foreignKey: 'movieId',
  as: 'functions',
});

CinemaFunction.belongsTo(Movie, {
  foreignKey: 'movieId',
  as: 'movie',
});

// User - Cart
User.hasOne(Cart, {
  foreignKey: 'user_id',
  as: 'cart',
});

Cart.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Cart - CartItem
Cart.hasMany(CartItem, {
  foreignKey: 'cart_id',
  as: 'items',
});

CartItem.belongsTo(Cart, {
  foreignKey: 'cart_id',
  as: 'cart',
});

// Snack - CartItem
Snack.hasMany(CartItem, {
  foreignKey: 'snack_id',
  as: 'cartItems',
});

CartItem.belongsTo(Snack, {
  foreignKey: 'snack_id',
  as: 'snack',
});

// Snack - Promotion
Snack.hasMany(Promotion, {
  foreignKey: 'snack_id',
  as: 'promotions',
});

Promotion.belongsTo(Snack, {
  foreignKey: 'snack_id',
  as: 'snack',
});

// Cart - CartTicket
Cart.hasMany(CartTicket, {
  foreignKey: 'cart_id',
  as: 'tickets',
});

CartTicket.belongsTo(Cart, {
  foreignKey: 'cart_id',
  as: 'cart',
});

// Function - CartTicket
CinemaFunction.hasMany(CartTicket, {
  foreignKey: 'function_id',
  as: 'cartTickets',
});

CartTicket.belongsTo(CinemaFunction, {
  foreignKey: 'function_id',
  as: 'function',
});

// Reservation - CartTicket
Reservation.hasOne(CartTicket, {
  foreignKey: 'reservation_id',
  as: 'cartTicket',
});

CartTicket.belongsTo(Reservation, {
  foreignKey: 'reservation_id',
  as: 'reservation',
});

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
  PurchaseHistory,
  NotificationPreference,
  UpcomingMovieNotification,
  City,
  Cinema,
  Department,
  Country,
  Movie,
  RefreshToken,
  LoginAudit,
  PasswordResetToken,
  Room,
  CinemaFunction,
  SeatType,
  Seat,
  Reservation,
  ReservationSeat,
  Cart,
  CartItem,
  CartTicket,
  Snack,
  Promotion,
};
