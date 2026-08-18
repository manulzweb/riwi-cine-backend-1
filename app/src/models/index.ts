// app/src/models/index.ts

import sequelize from '../config/database';
import User from './user.model';
import Role from './role.model';
import EmailVerificationToken from './email-verification-token.model';
import Profile from './profile.model';
import Membership from './membership.model';
import MembershipLevel from './membership-level.model';
import MembershipStatus from './membership-status.model';
import BonusWallet from './bonus-wallet.model';
import PurchaseHistory from './purchase-history.model';
import NotificationPreference from './notification-preference.model';
import UpcomingMovieNotification from './upcoming-movie-notification.model';
import City from './city.model';
import Cinema from './cinema.model';
import Department from './department.model';
import Country from './country.model';
import Movie from './movie.model';
import RefreshToken from './refresh-token.model';
import LoginAudit from './login-audit.model';
import PasswordResetToken from './password-reset-token.model';
import MovieStatus from './movie-status.model';

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

// User - RefreshToken
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - LoginAudit
User.hasMany(LoginAudit, { foreignKey: 'user_id', as: 'loginAudits' });
LoginAudit.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - PasswordResetToken
User.hasMany(PasswordResetToken, { foreignKey: 'user_id', as: 'passwordResetTokens' });
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// MovieStatus - Movie
MovieStatus.hasMany(Movie, { foreignKey: 'statusId', as: 'movies' });
Movie.belongsTo(MovieStatus, { foreignKey: 'statusId', as: 'movieStatus' });

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
  MovieStatus,
};
