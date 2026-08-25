// app/src/services/interfaces/country.service.interface.ts

import Country from '../../models/country.model';

export interface ICountryService {
  findAll(): Promise<Country[]>;
}
