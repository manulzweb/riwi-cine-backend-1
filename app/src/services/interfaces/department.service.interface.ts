// app/src/services/interfaces/department.service.interface.ts

import Department from '../../models/department.model';

export interface IDepartmentService {
  findByCountryId(countryId: number): Promise<Department[]>;
}
