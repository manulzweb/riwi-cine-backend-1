// app/src/repositories/interfaces/country.repository.interface.ts

import Country from '../../models/country.model';

export interface ICountryRepository {
  findAll(): Promise<Country[]>;
}
