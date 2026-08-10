import Department from "../models/department.model";
import repository from "../repositories/department.repository";
import { IDepartmentService } from "./interfaces/department.service.interface";

class DepartmentService implements IDepartmentService {
  async findByCountryId(countryId: number): Promise<Department[]> {
    return await repository.findByCountryId(countryId);
  }
}

export default new DepartmentService();
