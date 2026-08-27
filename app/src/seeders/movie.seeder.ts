// app/src/seeders/movie.seeder.ts

/**
 * Seeder de prueba para HU-004.
 *
 * Uso:
 *   1. Con el contenedor de la app corriendo:
 *        docker-compose exec app npx ts-node src/seeders/movie.seeder.ts
 *   2. O en local (fuera de Docker), con el .env apuntando a tu Postgres:
 *        npx ts-node src/seeders/movie.seeder.ts
 *
 * Esto inserta 3 películas y varias funciones para poder probar los
 * endpoints de HU-004 sin depender de que otras HU ya estén listas.
 */

import sequelize from '../config/database.js';
import Movie from '../models/movie.model.js';
import MovieFunction from '../models/function.model.js';

const seed = async () => {
  await sequelize.authenticate();
  await sequelize.sync(); // crea las tablas si no existen

  const movie1 = await Movie.create({
    title: 'Guardianes del Tiempo',
    synopsis:
      'Un grupo de exploradores debe viajar entre líneas temporales para evitar una catástrofe.',
    director: 'Ana Restrepo',
    actors: ['Carlos Mora', 'Lucía Fernández', 'Pedro Salas'],
    genres: ['Ciencia Ficción', 'Aventura'],
    languages: ['Español', 'Subtitulada'],
    formats: ['2D', '3D', 'IMAX'],
    duration: 128,
    classification: 'PG-13',
    releaseDate: new Date('2026-08-01'),
    posterUrl: 'https://picsum.photos/seed/movie1/400/600',
    bannerUrl: 'https://picsum.photos/seed/movie1-banner/1200/500',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    averageRating: 4.5,
  });

  const movie2 = await Movie.create({
    title: 'Risas en el Barrio',
    synopsis: 'Una comedia sobre un vecindario que se une para salvar su cine local.',
    director: 'Julián Torres',
    actors: ['Mariana Gil', 'Andrés Pardo'],
    genres: ['Comedia', 'Drama'],
    languages: ['Español'],
    formats: ['2D'],
    duration: 102,
    classification: 'PG',
    releaseDate: new Date('2026-07-20'),
    posterUrl: 'https://picsum.photos/seed/movie2/400/600',
    bannerUrl: 'https://picsum.photos/seed/movie2-banner/1200/500',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    averageRating: 4.0,
  });

  const movie3 = await Movie.create({
    title: 'Estrella Fugaz',
    synopsis:
      'Una odisea espacial sobre una tripulación que busca un nuevo hogar para la humanidad.',
    director: 'Ana Restrepo',
    actors: ['Diego León', 'Valeria Ospina'],
    genres: ['Ciencia Ficción', 'Drama'],
    languages: ['Español', 'Doblada'],
    formats: ['2D', 'IMAX', 'VIP'],
    duration: 140,
    classification: 'PG-13',
    releaseDate: new Date('2026-08-05'),
    posterUrl: 'https://picsum.photos/seed/movie3/400/600',
    bannerUrl: 'https://picsum.photos/seed/movie3-banner/1200/500',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    averageRating: 4.8,
  });

  const inTwoDays = new Date();
  inTwoDays.setDate(inTwoDays.getDate() + 2);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await MovieFunction.bulkCreate([
    // Funciones futuras (deben aparecer en /functions)
    {
      movieId: movie1.id,
      dateTime: inTwoDays,
      format: '2D',
      room: 'Sala 1',
      price: 12000,
      totalSeats: 80,
      availableSeats: 40,
    },
    {
      movieId: movie1.id,
      dateTime: inTwoDays,
      format: 'IMAX',
      room: 'Sala IMAX',
      price: 22000,
      totalSeats: 100,
      availableSeats: 0,
    }, // agotada -> soldOut true
    {
      movieId: movie2.id,
      dateTime: inTwoDays,
      format: '2D',
      room: 'Sala 2',
      price: 11000,
      totalSeats: 60,
      availableSeats: 60,
    },
    {
      movieId: movie3.id,
      dateTime: inTwoDays,
      format: 'VIP',
      room: 'Sala VIP',
      price: 28000,
      totalSeats: 40,
      availableSeats: 10,
    },

    // Función pasada (NO debe aparecer en /functions, valida RN-014)
    {
      movieId: movie1.id,
      dateTime: yesterday,
      format: '2D',
      room: 'Sala 1',
      price: 12000,
      totalSeats: 80,
      availableSeats: 5,
    },
  ]);

  console.log('Seed de películas y funciones completado.');
  process.exit(0);
};

seed().catch((error) => {
  console.error('Error ejecutando el seeder:', error);
  process.exit(1);
});
