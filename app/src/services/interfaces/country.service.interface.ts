import Country from "../../models/country.model";

export interface ICountryService {
  findAll(): Promise<Country[]>;
}
