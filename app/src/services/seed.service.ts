// app/src/services/seed.service.ts

import bcrypt from 'bcryptjs';
import { Transaction } from 'sequelize';
import sequelize from '../config/database.js';
import { envConfig } from '../config/env.js';
import {
  Country,
  Department,
  City,
  Cinema,
  Room,
  SeatType,
  Movie,
  Snack,
  Promotion,
  User,
  Role,
  Profile,
  Membership,
  MembershipLevel,
  MembershipStatus,
  BonusWallet,
  NotificationPreference,
  PurchaseHistory,
} from '../models/index.js';
import { generateMembershipCode } from '../utils/crypto.util.js';
import { ISeedService, SeedPayload, SeedResult } from './interfaces/seed.service.interface.js';

export class SeedService implements ISeedService {
  private parseJson(buffer: Buffer): SeedPayload {
    const text = buffer.toString('utf-8');
    if (!text.trim()) {
      throw new Error('El archivo de seed está vacío.');
    }
    try {
      return JSON.parse(text) as SeedPayload;
    } catch {
      throw new Error('El formato del archivo JSON no es válido.');
    }
  }

  async seedFromBuffer(buffer: Buffer): Promise<SeedResult> {
    const payload = this.parseJson(buffer);
    return this.seedFromPayload(payload);
  }

  async seedFromPayload(payload: SeedPayload): Promise<SeedResult> {
    const result: SeedResult = {
      countries: 0,
      departments: 0,
      cities: 0,
      cinemas: 0,
      rooms: 0,
      seatTypes: 0,
      movies: 0,
      snacks: 0,
      promotions: 0,
      users: 0,
    };

    return await sequelize.transaction(async (t: Transaction) => {
      // 1. Países
      const countryMap = new Map<string, number>();
      if (payload.countries?.length) {
        for (const item of payload.countries) {
          const [country] = await Country.findOrCreate({
            where: { name: item.name },
            defaults: { name: item.name, isActive: true },
            transaction: t,
          });
          countryMap.set(country.name.toLowerCase(), country.id);
          result.countries++;
        }
      }

      // 2. Departamentos
      const deptMap = new Map<string, number>();
      if (payload.departments?.length) {
        for (const item of payload.departments) {
          const countryId =
            item.countryId ??
            (item.countryName ? countryMap.get(item.countryName.toLowerCase()) : undefined) ??
            countryMap.values().next().value ??
            1;

          const [dept] = await Department.findOrCreate({
            where: { name: item.name, countryId },
            defaults: { name: item.name, countryId, isActive: true },
            transaction: t,
          });
          deptMap.set(dept.name.toLowerCase(), dept.id);
          result.departments++;
        }
      }

      // 3. Ciudades
      const cityMap = new Map<string, number>();
      if (payload.cities?.length) {
        for (const item of payload.cities) {
          const departmentId =
            item.departmentId ??
            (item.departmentName ? deptMap.get(item.departmentName.toLowerCase()) : undefined) ??
            deptMap.values().next().value ??
            1;

          const [city] = await City.findOrCreate({
            where: { name: item.name, departmentId },
            defaults: { name: item.name, departmentId, isActive: true },
            transaction: t,
          });
          cityMap.set(city.name.toLowerCase(), city.id);
          result.cities++;
        }
      }

      // 4. Cines
      const cinemaMap = new Map<string, number>();
      if (payload.cinemas?.length) {
        for (const item of payload.cinemas) {
          const cityId =
            item.cityId ??
            (item.cityName ? cityMap.get(item.cityName.toLowerCase()) : undefined) ??
            cityMap.values().next().value ??
            1;

          const [cinema] = await Cinema.findOrCreate({
            where: { name: item.name, cityId },
            defaults: {
              name: item.name,
              address: item.address,
              cityId,
              isActive: item.isActive !== false,
            },
            transaction: t,
          });
          cinemaMap.set(cinema.name.toLowerCase(), cinema.id);
          result.cinemas++;
        }
      }

      // 5. Salas
      if (payload.rooms?.length) {
        for (const item of payload.rooms) {
          const cinemaId =
            item.cinemaId ??
            (item.cinemaName ? cinemaMap.get(item.cinemaName.toLowerCase()) : undefined) ??
            cinemaMap.values().next().value ??
            1;

          await Room.findOrCreate({
            where: { name: item.name, cinemaId },
            defaults: {
              name: item.name,
              cinemaId,
              format: item.format ?? '2D',
              capacity: item.capacity,
              isActive: item.isActive !== false,
            },
            transaction: t,
          });
          result.rooms++;
        }
      }

      // 6. Tipos de Sillas
      if (payload.seatTypes?.length) {
        for (const item of payload.seatTypes) {
          await SeatType.findOrCreate({
            where: { name: item.name },
            defaults: {
              name: item.name,
              priceFactor: item.priceFactor ?? 1.0,
              description: item.description ?? null,
            },
            transaction: t,
          });
          result.seatTypes++;
        }
      }

      // 7. Películas
      if (payload.movies?.length) {
        for (const item of payload.movies) {
          const [movie] = await Movie.findOrCreate({
            where: { title: item.title },
            defaults: {
              title: item.title,
              synopsis: item.synopsis,
              director: item.director ?? 'Director General',
              actors: item.actors ?? ['Actor Principal', 'Actor Secundario'],
              genres: item.genres ?? [item.genre ?? 'Acción'],
              languages: item.languages ?? ['Español', 'Subtitulada'],
              formats: item.formats ?? ['2D', '3D'],
              duration: item.duration,
              classification: typeof item.rating === 'string' ? item.rating : 'PG-13',
              releaseDate: item.releaseDate ? new Date(item.releaseDate) : new Date(),
              posterUrl:
                item.posterUrl ?? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
              bannerUrl:
                item.bannerUrl ?? 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c',
              trailerUrl: item.trailerUrl ?? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              averageRating: 4.5,
              active: item.isActive !== false,
              genre: item.genre ?? 'Acción',
              language: 'Español',
              isSubtitled: false,
              rating: typeof item.rating === 'number' ? item.rating : 4.5,
              isActive: item.isActive !== false,
            },
            transaction: t,
          });
          if (movie) result.movies++;
        }
      }

      // 8. Confitería (Snacks)
      const snackMap = new Map<string, number>();
      if (payload.snacks?.length) {
        for (const item of payload.snacks) {
          const [snack] = await Snack.findOrCreate({
            where: { name: item.name },
            defaults: {
              name: item.name,
              description: item.description ?? null,
              category: item.category,
              price: item.price,
              stock: item.stock,
              imageUrl: item.imageUrl ?? null,
              discountPercentage: item.discountPercentage ?? 0,
            },
            transaction: t,
          });
          snackMap.set(snack.name.toLowerCase(), snack.id);
          result.snacks++;
        }
      }

      // 9. Promociones
      if (payload.promotions?.length) {
        for (const item of payload.promotions) {
          const snackId =
            item.snackId ??
            (item.snackName ? snackMap.get(item.snackName.toLowerCase()) : undefined) ??
            snackMap.values().next().value ??
            1;

          await Promotion.findOrCreate({
            where: { name: item.name },
            defaults: {
              snackId,
              name: item.name,
              discountType: item.discountType,
              discountValue: item.discountValue,
              startDate: new Date(item.startDate),
              endDate: new Date(item.endDate),
              isActive: item.isActive !== false,
            },
            transaction: t,
          });
          result.promotions++;
        }
      }

      // 10. Usuarios
      if (payload.users?.length) {
        const defaultRole = await Role.findOne({ where: { name: 'cliente' }, transaction: t });
        const adminRole = await Role.findOne({ where: { name: 'admin' }, transaction: t });
        const defaultLevel = await MembershipLevel.findOne({
          where: { name: 'BÁSICA' },
          transaction: t,
        });
        const defaultStatus = await MembershipStatus.findOne({
          where: { name: 'Activa' },
          transaction: t,
        });

        for (const u of payload.users) {
          const existingUser = await User.findOne({
            where: { email: u.email.toLowerCase() },
            transaction: t,
          });
          if (existingUser) continue;

          const role = u.roleName === 'admin' ? adminRole : defaultRole;
          const passwordHash = await bcrypt.hash(u.password, envConfig.BCRYPT.ROUNDS);

          const user = await User.create(
            {
              roleId: role?.id ?? 1,
              email: u.email.toLowerCase(),
              passwordHash,
              isActive: true,
              personalDataConsent: true,
              termsConsent: true,
              commercialConsent: true,
            },
            { transaction: t },
          );

          const cityId =
            u.cityId ??
            (u.cityName ? cityMap.get(u.cityName.toLowerCase()) : undefined) ??
            cityMap.values().next().value ??
            1;

          await Profile.create(
            {
              userId: user.id,
              firstName: u.firstName,
              lastName: u.lastName,
              documentType: u.documentType ?? 'CC',
              documentNumber: u.documentNumber ?? `DOC-${user.id}`,
              birthDate: new Date('1995-01-01'),
              phone: u.phone ?? '3000000000',
              cityId,
            },
            { transaction: t },
          );

          if (defaultLevel && defaultStatus) {
            await Membership.create(
              {
                userId: user.id,
                code: generateMembershipCode(),
                levelId: defaultLevel.id,
                statusId: defaultStatus.id,
                pointsBalance: 100,
              },
              { transaction: t },
            );
          }

          await BonusWallet.create({ userId: user.id, balance: 0 }, { transaction: t });
          await PurchaseHistory.create({ userId: user.id }, { transaction: t });
          await NotificationPreference.create(
            {
              userId: user.id,
              emailEnabled: true,
              smsEnabled: true,
              pushEnabled: true,
            },
            { transaction: t },
          );

          result.users++;
        }
      }

      return result;
    });
  }
}

export default SeedService;
