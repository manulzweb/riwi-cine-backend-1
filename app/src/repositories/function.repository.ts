// app/src/repositories/function.repository.ts

import { Op, WhereOptions } from 'sequelize';
import CinemaFunction from '../models/function.model';
import Movie from '../models/movie.model';
import Room from '../models/room.model';
import { IFunctionRepository } from './interfaces/function.repository.interface';
import { FunctionFiltersDto } from '../dto/function-detail.dto';

/**
 * Repositorio de Funciones (HU-009)
 * ------------------------------------
 * Única capa que sabe cómo consultar Sequelize para la entidad `CinemaFunction`.
 * No contiene reglas de negocio: solo arma la consulta.
 *
 * La asociación `CinemaFunction.belongsTo(Movie, { as: 'movie' })` ya está
 * definida dentro de function.model.ts, así que aquí solo la aprovechamos
 * con `include`.
 */
class FunctionRepository implements IFunctionRepository {
  async findById(id: number): Promise<CinemaFunction | null> {
    return await CinemaFunction.findByPk(id, {
      include: [{ model: Movie, as: 'movie' }],
    });
  }

  /**
   * Lista las funciones seleccionables de una película.
   *
   * RN-035 y RN-036 se aplican desde la propia query (`active = true`
   * y `date_time > NOW()`), de modo que el listado solo devuelve
   * funciones disponibles. Los filtros de formato, fecha y complejo
   * son opcionales y acumulativos.
   */
  async findAllByMovie(
    movieId: number,
    filters: FunctionFiltersDto = {},
  ): Promise<CinemaFunction[]> {
    // RN-035: no iniciadas; RN-036: activas. Ambas desde la query.
    const dateConditions: WhereOptions[] = [{ dateTime: { [Op.gt]: new Date() } }];

    if (filters.date) {
      const start = new Date(`${filters.date}T00:00:00`);
      const end = new Date(`${filters.date}T23:59:59.999`);
      dateConditions.push({ dateTime: { [Op.gte]: start } }, { dateTime: { [Op.lte]: end } });
    }

    return await CinemaFunction.findAll({
      where: {
        movieId,
        active: true,
        ...(filters.format ? { format: filters.format } : {}),
        [Op.and]: dateConditions,
      },
      // El filtro por complejo se resuelve con un INNER JOIN contra la
      // sala de la función, que es la que conoce su cine (cinemaId).
      include: filters.cinemaId
        ? [
            {
              model: Room,
              as: 'roomRelation',
              required: true,
              where: { cinemaId: filters.cinemaId },
            },
          ]
        : [{ model: Room, as: 'roomRelation' }],
      order: [['dateTime', 'ASC']],
    });
  }
}

export default new FunctionRepository();
