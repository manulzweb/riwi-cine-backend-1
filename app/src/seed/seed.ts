import {
  Role,
  MembershipLevel,
  MembershipStatus,
  Country,
  Department,
  City,
  Cinema,
} from '../models';
import Movie from '../models/movie.model';
import Room from '../models/room.model';
import CinemaFunction from '../models/function.model';

export const runSeed = async (): Promise<void> => {
  // Roles
  await Role.findOrCreate({
    where: { name: 'cliente' },
    defaults: { name: 'cliente', description: 'Usuario final del portal Multicine.' },
  });
  await Role.findOrCreate({
    where: { name: 'admin' },
    defaults: { name: 'admin', description: 'Administrador de la plataforma.' },
  });

  // Membership
  await MembershipLevel.findOrCreate({
    where: { name: 'BÁSICA' },
    defaults: { name: 'BÁSICA', description: 'Nivel inicial de membresía digital.' },
  });
  await MembershipStatus.findOrCreate({
    where: { name: 'Activa' },
    defaults: { name: 'Activa', description: 'Membresía activa y habilitada para beneficios.' },
  });
  await MembershipStatus.findOrCreate({
    where: { name: 'Inactiva' },
    defaults: { name: 'Inactiva', description: 'Membresía inactiva.' },
  });

  // Geografía
  const [colombia] = await Country.findOrCreate({
    where: { name: 'Colombia' },
  });
  const [antioquia] = await Department.findOrCreate({
    where: { name: 'Antioquia', countryId: colombia.id },
  });
  const [cundinamarca] = await Department.findOrCreate({
    where: { name: 'Cundinamarca', countryId: colombia.id },
  });
  const [valle] = await Department.findOrCreate({
    where: { name: 'Valle del Cauca', countryId: colombia.id },
  });

  await City.findOrCreate({
    where: { name: 'Medellín', departmentId: antioquia.id },
  });
  await City.findOrCreate({
    where: { name: 'Bogotá', departmentId: cundinamarca.id },
  });
  await City.findOrCreate({
    where: { name: 'Cali', departmentId: valle.id },
  });

  // Cines
  const [cinemaMed] = await Cinema.findOrCreate({
    where: { name: 'Multicine El Poblado' },
    defaults: {
      name: 'Multicine El Poblado',
      city: 'Medellín',
      address: 'Calle 10 # 43D-15, El Poblado, Medellín',
      isActive: true,
    },
  });
  const [cinemaBog] = await Cinema.findOrCreate({
    where: { name: 'Multicine Andino' },
    defaults: {
      name: 'Multicine Andino',
      city: 'Bogotá',
      address: 'Cra. 11 #82-71, Bogotá',
      isActive: true,
    },
  });

  // Salas
  const [sala1Med] = await Room.findOrCreate({
    where: { name: 'Sala 1', cinemaId: cinemaMed.id },
    defaults: {
      name: 'Sala 1',
      format: '2D',
      capacity: 80,
      cinemaId: cinemaMed.id,
      isActive: true,
    },
  });
  const [salaImax] = await Room.findOrCreate({
    where: { name: 'Sala IMAX', cinemaId: cinemaMed.id },
    defaults: {
      name: 'Sala IMAX',
      format: 'IMAX',
      capacity: 120,
      cinemaId: cinemaMed.id,
      isActive: true,
    },
  });
  const [salaVip] = await Room.findOrCreate({
    where: { name: 'Sala VIP', cinemaId: cinemaBog.id },
    defaults: {
      name: 'Sala VIP',
      format: 'VIP',
      capacity: 40,
      cinemaId: cinemaBog.id,
      isActive: true,
    },
  });
  const [sala2Bog] = await Room.findOrCreate({
    where: { name: 'Sala 2', cinemaId: cinemaBog.id },
    defaults: {
      name: 'Sala 2',
      format: '3D',
      capacity: 90,
      cinemaId: cinemaBog.id,
      isActive: true,
    },
  });

  // Películas
  if ((await Movie.count()) > 0) return;

  const today = new Date();
  const inTwoDays = new Date(today);
  inTwoDays.setDate(today.getDate() + 2);
  const inFourDays = new Date(today);
  inFourDays.setDate(today.getDate() + 4);
  const inSixDays = new Date(today);
  inSixDays.setDate(today.getDate() + 6);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const at20h = (d: Date) => {
    const r = new Date(d);
    r.setHours(20, 0, 0, 0);
    return r;
  };
  const at16h = (d: Date) => {
    const r = new Date(d);
    r.setHours(16, 0, 0, 0);
    return r;
  };
  const at22h = (d: Date) => {
    const r = new Date(d);
    r.setHours(22, 0, 0, 0);
    return r;
  };
  const todayAt18h = new Date(today);
  todayAt18h.setHours(18, 0, 0, 0);

  const movie1 = await Movie.create({
    title: 'The Avengers: Endgame',
    synopsis:
      'Los Vengadores se reúnen para enfrentar la mayor amenaza que el universo jamás ha conocido.',
    director: 'Anthony Russo, Joe Russo',
    actors: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth'],
    genres: ['Acción', 'Aventura', 'Ciencia Ficción'],
    languages: ['Español', 'Inglés'],
    formats: ['2D', '3D', 'IMAX'],
    duration: 181,
    classification: 'PG-13',
    releaseDate: new Date('2019-04-26'),
    posterUrl: 'https://picsum.photos/seed/avengers/400/600',
    bannerUrl: 'https://picsum.photos/seed/avengers-banner/1200/500',
    trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
    averageRating: 4.8,
    active: true,
    isActive: true,
  });

  const movie2 = await Movie.create({
    title: 'The Dark Knight Rises',
    synopsis: 'Batman enfrenta su mayor desafío cuando emerge una nueva amenaza en Gotham City.',
    director: 'Christopher Nolan',
    actors: ['Christian Bale', 'Tom Hardy', 'Anne Hathaway', 'Joseph Gordon-Levitt'],
    genres: ['Acción', 'Drama', 'Crimen'],
    languages: ['Español'],
    formats: ['2D', 'IMAX'],
    duration: 164,
    classification: 'PG-13',
    releaseDate: new Date('2012-07-20'),
    posterUrl: 'https://picsum.photos/seed/batman/400/600',
    bannerUrl: 'https://picsum.photos/seed/batman-banner/1200/500',
    trailerUrl: 'https://www.youtube.com/watch?v=EEzXRBnBgSo',
    averageRating: 4.9,
    active: true,
    isActive: true,
  });

  const movie3 = await Movie.create({
    title: 'Spider-Man: No Way Home',
    synopsis:
      'Spider-Man se ve obligado a descubrir quién es realmente cuando su identidad es revelada.',
    director: 'Jon Watts',
    actors: ['Tom Holland', 'Zendaya', 'Benedict Cumberbatch'],
    genres: ['Acción', 'Aventura', 'Superhéroes'],
    languages: ['Español', 'Inglés'],
    formats: ['2D', '3D', 'VIP'],
    duration: 159,
    classification: 'PG-13',
    releaseDate: new Date('2021-12-17'),
    posterUrl: 'https://picsum.photos/seed/spiderman/400/600',
    bannerUrl: 'https://picsum.photos/seed/spiderman-banner/1200/500',
    trailerUrl: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
    averageRating: 4.7,
    active: true,
    isActive: true,
  });

  // Funciones
  await CinemaFunction.bulkCreate([
    {
      movieId: movie1.id,
      roomId: sala1Med.id,
      startTime: todayAt18h,
      dateTime: todayAt18h,
      format: '2D',
      room: 'Sala 1',
      price: 12000,
      totalSeats: 80,
      availableSeats: 40,
      active: true,
      isActive: true,
    },
    {
      movieId: movie1.id,
      roomId: salaImax.id,
      startTime: at20h(inTwoDays),
      dateTime: at20h(inTwoDays),
      format: 'IMAX',
      room: 'Sala IMAX',
      price: 22000,
      totalSeats: 120,
      availableSeats: 0,
      active: true,
      isActive: true,
    },
    {
      movieId: movie1.id,
      roomId: sala1Med.id,
      startTime: at16h(inFourDays),
      dateTime: at16h(inFourDays),
      format: '2D',
      room: 'Sala 1',
      price: 12000,
      totalSeats: 80,
      availableSeats: 75,
      active: true,
      isActive: true,
    },
    {
      movieId: movie2.id,
      roomId: sala1Med.id,
      startTime: at16h(inTwoDays),
      dateTime: at16h(inTwoDays),
      format: '2D',
      room: 'Sala 1',
      price: 11000,
      totalSeats: 80,
      availableSeats: 60,
      active: true,
      isActive: true,
    },
    {
      movieId: movie2.id,
      roomId: sala2Bog.id,
      startTime: at22h(inFourDays),
      dateTime: at22h(inFourDays),
      format: '3D',
      room: 'Sala 2',
      price: 15000,
      totalSeats: 90,
      availableSeats: 50,
      active: true,
      isActive: true,
    },
    {
      movieId: movie3.id,
      roomId: salaVip.id,
      startTime: at20h(inTwoDays),
      dateTime: at20h(inTwoDays),
      format: 'VIP',
      room: 'Sala VIP',
      price: 28000,
      totalSeats: 40,
      availableSeats: 10,
      active: true,
      isActive: true,
    },
    {
      movieId: movie3.id,
      roomId: salaImax.id,
      startTime: at20h(inSixDays),
      dateTime: at20h(inSixDays),
      format: 'IMAX',
      room: 'Sala IMAX',
      price: 22000,
      totalSeats: 120,
      availableSeats: 80,
      active: true,
      isActive: true,
    },
    {
      movieId: movie1.id,
      roomId: sala1Med.id,
      startTime: at20h(yesterday),
      dateTime: at20h(yesterday),
      format: '2D',
      room: 'Sala 1',
      price: 12000,
      totalSeats: 80,
      availableSeats: 5,
      active: true,
      isActive: true,
    },
  ]);

  console.log('Seed: data insertada');
};
