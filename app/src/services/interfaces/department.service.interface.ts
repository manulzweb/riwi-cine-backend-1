// app/src/services/interfaces/department.service.interface.ts

import Department from '../../models/department.model.js';

export interface IDepartmentService {
  findByCountryId(countryId: number): Promise<Department[]>;
}
