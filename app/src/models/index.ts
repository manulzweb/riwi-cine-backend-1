// app/src/models/index.ts

import sequelize from '../config/database';
import User from './user.model';
import Role from './role.model';
import EmailVerificationToken from './email-verification-model';
import Profile from './profile.model';
import Room from './room.model';
import CinemaFunction from './function.model';
import SeatType from './seat-type.model';
import Seat from './seat.model';
import Reservation from './reservation.model';
import ReservationSeat from './reservation-seat.model';
import Membership from './membership.model';
import MembershipLevel from './membership-level.model';
import MembershipStatus from './membership-status.model';
import BonusWallet from './bonus-wallet.model';
import NotificationPreference from './notification-preference.model';
import City from './city.model';
import Cinema from './cinema.model';
import Department from './department.model';
import Country from './country.model';

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
  Room,
  CinemaFunction,
  SeatType,
  Seat,
  Reservation,
  ReservationSeat,
};
