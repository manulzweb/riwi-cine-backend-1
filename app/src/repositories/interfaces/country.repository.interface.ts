import Country from "../../models/country.model";

export interface ICountryRepository {
  findAll(): Promise<Country[]>;
}
