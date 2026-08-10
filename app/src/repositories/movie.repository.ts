// app/src/repositories/movie.repository.ts

import { Op } from "sequelize";
import Movie from "../models/movie.model";
import MovieFunction from "../models/function.model";
import { IMovieRepository } from "./interfaces/movie.repository.interface";

/**
 * Repositorio de Películas.
 * Única capa que sabe cómo consultar Sequelize para la entidad Movie.
 */
class MovieRepository implements IMovieRepository {
  async findById(id: number): Promise<Movie | null> {
    return await Movie.findOne({ where: { id, active: true } });
  }

  async findFunctionsByMovieId(movieId: number): Promise<MovieFunction[]> {
    return await MovieFunction.findAll({
      where: { movieId },
      order: [["dateTime", "ASC"]],
    });
  }

  async findByGenres(
    genres: string[],
    excludeId: number,
    limit: number
  ): Promise<Movie[]> {
    return await Movie.findAll({
      where: {
        id: { [Op.ne]: excludeId },
        active: true,
        genres: { [Op.overlap]: genres },
      },
      order: [["averageRating", "DESC"]],
      limit,
    });
  }
}

export default new MovieRepository();
