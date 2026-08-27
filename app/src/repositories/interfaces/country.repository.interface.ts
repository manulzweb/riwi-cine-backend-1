// app/src/repositories/interfaces/country.repository.interface.ts

import Country from '../../models/country.model.js';

export interface ICountryRepository {
  findAll(): Promise<Country[]>;
}
