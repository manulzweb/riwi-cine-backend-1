import Department from "../models/department.model";
import { IDepartmentRepository } from "./interfaces/department.repository.interface";

class DepartmentRepository implements IDepartmentRepository {
  async findByCountryId(countryId: number): Promise<Department[]> {
    return await Department.findAll({ where: { countryId } });
  }
}

export default new DepartmentRepository();
