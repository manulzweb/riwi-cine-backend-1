import Country from "../models/country.model";
import { ICountryRepository } from "./interfaces/country.repository.interface";

class CountryRepository implements ICountryRepository {
  async findAll(): Promise<Country[]> {
    return await Country.findAll();
  }
}

export default new CountryRepository();
