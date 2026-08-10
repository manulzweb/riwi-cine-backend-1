// app/src/seed/seed.ts

import { Role, MembershipLevel, MembershipStatus } from '../models';
import Country from '../models/country.model';
import Department from '../models/department.model';
import City from '../models/city.model';
import Cinema from '../models/cinema.model';
import Room from '../models/room.model';
import Movie from '../models/movie.model';
import CinemaFunction from '../models/function.model';

export const runSeed = async (): Promise<void> => {
  // 1. Roles
  await Role.findOrCreate({
    where: { name: 'cliente' },
    defaults: { name: 'cliente', description: 'Usuario final del portal Multicine.' },
  });
  await Role.findOrCreate({
    where: { name: 'admin' },
    defaults: { name: 'admin', description: 'Administrador de la plataforma.' },
  });

  // 2. Membership Levels
  await MembershipLevel.findOrCreate({
    where: { name: 'BÁSICA' },
    defaults: { name: 'BÁSICA', description: 'Nivel inicial de membresía digital.' },
  });

  // 3. Membership Statuses
  await MembershipStatus.findOrCreate({
    where: { name: 'Activa' },
    defaults: { name: 'Activa', description: 'Membresía activa y habilitada para beneficios.' },
  });
  await MembershipStatus.findOrCreate({
    where: { name: 'Inactiva' },
    defaults: { name: 'Inactiva', description: 'Membresía inactiva.' },
  });

  // 4. Country
  const [country] = await Country.findOrCreate({
    where: { name: 'Colombia' },
    defaults: { name: 'Colombia' },
  });

  // 5. Department
  const [department] = await Department.findOrCreate({
    where: { name: 'Antioquia', countryId: country.id },
    defaults: { name: 'Antioquia', countryId: country.id },
  });

  // 6. City
  const [city] = await City.findOrCreate({
    where: { name: 'Medellín', departmentId: department.id },
    defaults: { name: 'Medellín', departmentId: department.id, isActive: true },
  });

  // 7. Cinema
  const [cinema] = await Cinema.findOrCreate({
    where: { name: 'Multicine El Tesoro', city: 'Medellín' },
    defaults: {
      name: 'Multicine El Tesoro',
      city: 'Medellín',
      address: 'Carrera 25A # 1A Sur - 45',
      isActive: true,
    },
  });

  // 8. Room
  const [room] = await Room.findOrCreate({
    where: { name: 'Sala IMAX 1', cinemaId: cinema.id },
    defaults: {
      name: 'Sala IMAX 1',
      format: 'IMAX',
      capacity: 250,
      cinemaId: cinema.id,
      isActive: true,
    },
  });

  // 9. Movie
  const [movie] = await Movie.findOrCreate({
    where: { title: 'Batman: El Caballero de la Noche' },
    defaults: {
      title: 'Batman: El Caballero de la Noche',
      synopsis: 'Batman enfrenta al Guasón para salvar a Ciudad Gótica en una batalla épica.',
      director: 'Christopher Nolan',
      actors: ['Christian Bale', 'Heath Ledger', 'Gary Oldman'],
      genres: ['Acción', 'Drama', 'Suspenso'],
      languages: ['Español', 'Inglés'],
      formats: ['2D', 'IMAX'],
      duration: 152,
      classification: 'PG-13',
      releaseDate: new Date('2008-07-18'),
      posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406',
      bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
      trailerUrl: 'EXeTwQWrcwY', // ID de video de YouTube
      averageRating: 4.9,
      active: true,
      genre: 'Acción',
      language: 'Doblada',
      isSubtitled: false,
      rating: 4.9,
      isActive: true,
    },
  });

  // 10. Cinema Functions (Future functions)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(tomorrowEnd.getHours() + 3);

  await CinemaFunction.findOrCreate({
    where: { movieId: movie.id, format: 'IMAX' },
    defaults: {
      movieId: movie.id,
      roomId: room.id,
      startTime: tomorrow,
      endTime: tomorrowEnd,
      price: 18000,
      availableSeats: 250,
      isActive: true,
      dateTime: tomorrow,
      format: 'IMAX',
      room: 'Sala IMAX 1',
      totalSeats: 250,
      active: true,
    },
  });

  console.log('Seed ejecutado: todos los datos mock (país, depto, ciudad, cine, sala, película, funciones) creados.');
};