// app/src/repositories/function.repository.ts

import CinemaFunction from '../models/function.model';
import Movie from '../models/movie.model';
import { IFunctionRepository } from './interfaces/function.repository.interface';

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
}

export default new FunctionRepository();
