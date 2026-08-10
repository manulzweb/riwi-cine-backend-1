import City from "../models/city.model";
import Cinema from "../models/cinema.model";
import { Op } from "sequelize";
import { ICityRepository } from "./interfaces/city.repository.interface";

class CityRepository implements ICityRepository {
  async findByDepartmentId(departmentId: number): Promise<City[]> {
    const activeCinemaCityIds = await Cinema.findAll({
      where: { isActive: true },
      attributes: ["cityId"],
      group: ["cityId"],
    });

    const cityIds = activeCinemaCityIds.map((c: Cinema) => c.cityId);

    if (cityIds.length === 0) {
      return [];
    }

    return await City.findAll({
      where: {
        departmentId,
        isActive: true,
        id: { [Op.in]: cityIds },
      },
    });
  }
}

export default new CityRepository();
