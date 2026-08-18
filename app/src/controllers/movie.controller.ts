// app/src/controllers/movie.controller.ts

import { Request, Response } from 'express';
import movieService from '../services/movie.service';
import { FilterMoviesDto } from '../dto/filter-movies.dto';

/**
 * Controlador de Películas
 * -------------------------
 * Gestiona las peticiones HTTP de cartelera y detalle de películas.
 */

// --- Métodos de HU-004 ---
export const getMovieDetail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'El id de la película es inválido.' });
    }

    const movie = await movieService.getMovieDetail(id);

    if (!movie) {
      return res.status(404).json({ error: 'Película no encontrada.' });
    }

    return res.status(200).json(movie);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};

export const getMovieFunctions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'El id de la película es inválido.' });
    }

    const functions = await movieService.getMovieFunctions(id);

    if (!functions) {
      return res.status(404).json({ error: 'Película no encontrada.' });
    }

    return res.status(200).json(functions);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};

export const getMovieRecommendations = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'El id de la película es inválido.' });
    }

    const recommendations = await movieService.getMovieRecommendations(id);

    if (!recommendations) {
      return res.status(404).json({ error: 'Película no encontrada.' });
    }

    return res.status(200).json(recommendations);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};

// --- Métodos de HU-005 ---
export const getUpcomingMovies = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const movies = await movieService.findUpcoming();
    return res.status(200).json(movies);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};

// --- Métodos de develop / HU-003 ---
export const getMovies = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const movies = await movieService.findAll();
    return res.status(200).json(movies);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({
      error: message,
    });
  }
};

export const getWeeklyMovies = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const movies = await movieService.findWeekly();
    return res.status(200).json(movies);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({
      error: message,
    });
  }
};

export const getTodayMovies = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const movies = await movieService.findToday();
    return res.status(200).json(movies);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({
      error: message,
    });
  }
};

export const getMoviesByFilter = async (req: Request, res: Response): Promise<Response> => {
  try {
    const filters: FilterMoviesDto = {
      date: req.query.date as string,
      genre: req.query.genre as string,
      classification: req.query.classification as string,
      language: req.query.language as string,
      format: req.query.format as string,
      cinemaId: req.query.cinemaId ? Number(req.query.cinemaId) : undefined,
      available: req.query.available === 'true' ? true : undefined,
    };

    const movies = await movieService.findByFilters(filters);
    return res.status(200).json(movies);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({
      error: message,
    });
  }
};
