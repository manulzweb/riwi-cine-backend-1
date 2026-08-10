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

  // 5. Departments
  const [antioquia] = await Department.findOrCreate({
    where: { name: 'Antioquia', countryId: country.id },
    defaults: { name: 'Antioquia', countryId: country.id },
  });

  const [atlantico] = await Department.findOrCreate({
    where: { name: 'Atlántico', countryId: country.id },
    defaults: { name: 'Atlántico', countryId: country.id },
  });

  // 6. Cities
  const [medellin] = await City.findOrCreate({
    where: { name: 'Medellín', departmentId: antioquia.id },
    defaults: { name: 'Medellín', departmentId: antioquia.id, isActive: true },
  });

  const [barranquilla] = await City.findOrCreate({
    where: { name: 'Barranquilla', departmentId: atlantico.id },
    defaults: { name: 'Barranquilla', departmentId: atlantico.id, isActive: true },
  });

  // 7. Cinemas
  const [cinemaMedellin] = await Cinema.findOrCreate({
    where: { name: 'Multicine El Tesoro', city: 'Medellín' },
    defaults: {
      name: 'Multicine El Tesoro',
      city: 'Medellín',
      address: 'Carrera 25A # 1A Sur - 45',
      isActive: true,
    },
  });

  const [cinemaBarranquilla] = await Cinema.findOrCreate({
    where: { name: 'Multicine Buenavista', city: 'Barranquilla' },
    defaults: {
      name: 'Multicine Buenavista',
      city: 'Barranquilla',
      address: 'Calle 98 # 52-115',
      isActive: true,
    },
  });

  // 8. Rooms
  const [roomMedellin] = await Room.findOrCreate({
    where: { name: 'Sala IMAX 1', cinemaId: cinemaMedellin.id },
    defaults: {
      name: 'Sala IMAX 1',
      format: 'IMAX',
      capacity: 250,
      cinemaId: cinemaMedellin.id,
      isActive: true,
    },
  });

  const [roomBarranquilla] = await Room.findOrCreate({
    where: { name: 'Sala 2D 1', cinemaId: cinemaBarranquilla.id },
    defaults: {
      name: 'Sala 2D 1',
      format: '2D',
      capacity: 180,
      cinemaId: cinemaBarranquilla.id,
      isActive: true,
    },
  });

  // 9. Movies
  const [movieBatman] = await Movie.findOrCreate({
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

  const [movieSpiderman] = await Movie.findOrCreate({
    where: { title: 'Spiderman: New Brand' },
    defaults: {
      title: 'Spiderman: New Brand',
      synopsis: 'Una nueva aventura arácnida donde Peter Parker explora nuevos límites en el multiverso.',
      director: 'Jon Watts',
      actors: ['Tom Holland', 'Zendaya', 'Jacob Batalon'],
      genres: ['Acción', 'Ciencia Ficción', 'Aventura'],
      languages: ['Español', 'Inglés'],
      formats: ['2D', '3D', 'VIP'],
      duration: 135,
      classification: 'PG-13',
      releaseDate: new Date('2026-08-01'),
      posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820',
      bannerUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
      trailerUrl: 'JfVOs4VSpmA', // ID de video de YouTube
      averageRating: 4.8,
      active: true,
      genre: 'Ciencia Ficción',
      language: 'Subtitulada',
      isSubtitled: true,
      rating: 4.8,
      isActive: true,
    },
  });

  // 10. Cinema Functions (Future functions)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(tomorrowEnd.getHours() + 3);

  // Function for Batman in Medellín
  await CinemaFunction.findOrCreate({
    where: { movieId: movieBatman.id, format: 'IMAX', roomId: roomMedellin.id },
    defaults: {
      movieId: movieBatman.id,
      roomId: roomMedellin.id,
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

  // Function for Spiderman in Barranquilla
  await CinemaFunction.findOrCreate({
    where: { movieId: movieSpiderman.id, format: '2D', roomId: roomBarranquilla.id },
    defaults: {
      movieId: movieSpiderman.id,
      roomId: roomBarranquilla.id,
      startTime: tomorrow,
      endTime: tomorrowEnd,
      price: 14000,
      availableSeats: 180,
      isActive: true,
      dateTime: tomorrow,
      format: '2D',
      room: 'Sala 2D 1',
      totalSeats: 180,
      active: true,
    },
  });

  console.log('Seed ejecutado: todos los datos mock actualizados incluyendo Barranquilla y Spiderman: New Brand.');
};