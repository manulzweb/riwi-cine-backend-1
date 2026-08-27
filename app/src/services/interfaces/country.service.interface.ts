// app/src/services/interfaces/country.service.interface.ts

import Country from '../../models/country.model.js';

export interface ICountryService {
  findAll(): Promise<Country[]>;
}
