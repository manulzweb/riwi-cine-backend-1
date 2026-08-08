import City from "../../models/city.model";

export interface ICityRepository {
  findByDepartmentId(departmentId: number): Promise<City[]>;
}
