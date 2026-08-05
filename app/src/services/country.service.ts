import Country from "../models/country.model";
import repository from "../repositories/country.repository";
import { ICountryService } from "./interfaces/country.service.interface";

class CountryService implements ICountryService {
  async findAll(): Promise<Country[]> {
    return await repository.findAll();
  }
}

export default new CountryService();
