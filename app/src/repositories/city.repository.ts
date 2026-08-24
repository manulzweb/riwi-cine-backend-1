// app/src/repositories/city.repository.ts

import City from '../models/city.model';
import Cinema from '../models/cinema.model';
import { Op } from 'sequelize';
import { ICityRepository } from './interfaces/city.repository.interface';

/**
 * Repositorio de Ciudades
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad City.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */

class CityRepository implements ICityRepository {
  /**
   * Busca una ciudad por su identificador.
   */
  async findById(id: number): Promise<City | null> {
    return await City.findByPk(id);
  }

  /**
   * Obtiene las ciudades activas de un departamento que cuenten
   * con al menos un cine activo.
   */
  async findByDepartmentId(departmentId: number): Promise<City[]> {
    const activeCinemaCityNames = await Cinema.findAll({
      where: { isActive: true },
      attributes: ['city'],
      group: ['city'],
    });

    const cityNames = activeCinemaCityNames.map((c: Cinema) => c.city);

    if (cityNames.length === 0) {
      return [];
    }

    return await City.findAll({
      where: {
        departmentId,
        isActive: true,
        name: { [Op.in]: cityNames },
      },
    });
  }
}

export default new CityRepository();
