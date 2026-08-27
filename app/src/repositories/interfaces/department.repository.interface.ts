// app/src/repositories/interfaces/department.repository.interface.ts

import Department from '../../models/department.model.js';

export interface IDepartmentRepository {
  findByCountryId(countryId: number): Promise<Department[]>;
}
