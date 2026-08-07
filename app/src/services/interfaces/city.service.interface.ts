import City from "../../models/city.model";

export interface ICityService {
  findByDepartmentId(departmentId: number): Promise<City[]>;
}
