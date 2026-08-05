import City from "../models/city.model";
import repository from "../repositories/city.repository";
import { ICityService } from "./interfaces/city.service.interface";

class CityService implements ICityService {
  async findByDepartmentId(departmentId: number): Promise<City[]> {
    return await repository.findByDepartmentId(departmentId);
  }
}

export default new CityService();
