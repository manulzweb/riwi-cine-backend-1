import Department from "../../models/department.model";

export interface IDepartmentService {
  findByCountryId(countryId: number): Promise<Department[]>;
}
