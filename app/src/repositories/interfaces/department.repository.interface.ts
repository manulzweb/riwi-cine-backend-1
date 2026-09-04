// app/src/repositories/interfaces/department.repository.interface.ts

import Department from '../../models/department.model.js';

export interface IDepartmentRepository {
  findById(id: number): Promise<Department | null>;
  findByCountryId(countryId: number): Promise<Department[]>;
}
