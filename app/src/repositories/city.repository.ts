import City from '../models/city.model';
import Cinema from '../models/cinema.model';
import { Op } from 'sequelize';
import { ICityRepository } from './interfaces/city.repository.interface';

class CityRepository implements ICityRepository {
  async findById(id: number): Promise<City | null> {
    return await City.findByPk(id);
  }

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
