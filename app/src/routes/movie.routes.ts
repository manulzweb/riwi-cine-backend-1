// app/src/routes/movie.routes.ts

/**
 * Rutas de Películas
 * ------------------
 * Endpoints disponibles para Cartelera (HU-003) y Detalle (HU-004).
 */

import { Router } from 'express';
import {
  getMovies,
  getWeeklyMovies,
  getTodayMovies,
  getMoviesByFilter,
  getMovieDetail,
  getMovieFunctions,
  getMovieRecommendations,
} from '../controllers/movie.controller';

const router = Router();

// --- Rutas de Cartelera (develop / HU-003) ---
router.get('/', getMovies);
router.get('/weekly', getWeeklyMovies);
router.get('/today', getTodayMovies);
router.get('/filter', getMoviesByFilter);

// --- Rutas de Detalle (HEAD / HU-004) ---
router.get('/:id', getMovieDetail);
router.get('/:id/functions', getMovieFunctions);
router.get('/:id/recommendations', getMovieRecommendations);

export default router;
