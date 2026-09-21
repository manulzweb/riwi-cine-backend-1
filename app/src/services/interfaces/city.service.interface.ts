// app/src/services/interfaces/city.service.interface.ts

import City from '../../models/city.model.js';

export interface ICityService {
  findByDepartmentId(departmentId: number): Promise<City[]>;
}
