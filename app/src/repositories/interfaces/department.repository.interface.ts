import Department from "../../models/department.model";

export interface IDepartmentRepository {
  findByCountryId(countryId: number): Promise<Department[]>;
}
