// app/src/services/user.service.ts

import User from '../models/user.model.js';
import { UserLocationDto } from '../dto/request/user-location.dto.js';
import {
  LocationValidationError,
  CountryNotFoundError,
  DepartmentNotFoundError,
  DepartmentCountryMismatchError,
  CityNotFoundError,
  CityInactiveError,
  CityDepartmentMismatchError,
  CityWithoutCinemaError,
  DepartmentInactiveError,
  CountryInactiveError,
} from '../errors/location.errors.js';
import { IUserService } from './interfaces/user.service.interface.js';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface.js';
import { IDepartmentRepository } from '../repositories/interfaces/department.repository.interface.js';
import { ICityRepository } from '../repositories/interfaces/city.repository.interface.js';
import { ICountryRepository } from '../repositories/interfaces/country.repository.interface.js';
import { ICinemaRepository } from '../repositories/interfaces/cinema.repository.interface.js';
import { IProfileRepository } from '../repositories/interfaces/profile.repository.interface.js';

/**
 * Servicio encargado de gestionar la lógica de negocio relacionada
 * con los usuarios.
 *
 * Responsabilidades:
 * - Coordinar las operaciones relacionadas con la entidad `User`.
 * - Validar las reglas de negocio antes de modificar información.
 * - Coordinar operaciones entre diferentes modelos y repositorios.
 * - Mantener la lógica de negocio fuera de los controladores.
 *
 * @class UserService
 * @implements {IUserService}
 * @business
 * Las validaciones relacionadas con la ubicación del usuario garantizan
 * que la ciudad pertenezca al departamento seleccionado y que el
 * departamento pertenezca al país seleccionado.
 */
class UserService implements IUserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly countryRepository: ICountryRepository,
    private readonly departmentRepository: IDepartmentRepository,
    private readonly cityRepository: ICityRepository,
    private readonly cinemaRepository: ICinemaRepository,
    private readonly profileRepository: IProfileRepository,
  ) {
    this.userRepository = userRepository;
    this.countryRepository = countryRepository;
    this.departmentRepository = departmentRepository;
    this.cityRepository = cityRepository;
    this.cinemaRepository = cinemaRepository;
    this.profileRepository = profileRepository;
  }
  /**
   * Obtiene todos los usuarios registrados.
   *
   * La consulta es delegada al repositorio, manteniendo la responsabilidad
   * de acceso a datos separada de la lógica de negocio.
   *
   * @returns {Promise<User[]>}
   * Lista de usuarios registrados.
   */
  async findAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  /**
   * Actualiza la ubicación asociada al perfil de un usuario.
   *
   * Antes de actualizar el perfil, valida la existencia y consistencia
   * jerárquica de la ubicación:
   *
   * `País → Departamento → Ciudad`
   *
   * La ciudad debe estar activa y pertenecer al departamento seleccionado.
   * El departamento debe pertenecer al país seleccionado.
   *
   * Si se proporciona un `userId` y existe un perfil asociado, se actualiza
   * la ciudad del perfil.
   *
   * @param {UserLocationDto} dto
   * Datos de ubicación proporcionados para la actualización.
   *
   * @returns {Promise<void>}
   *
   * @throws {Error}
   * Cuando alguno de los identificadores requeridos no es proporcionado.
   *
   * @throws {Error}
   * Cuando la ciudad, departamento o país no existe.
   *
   * @throws {Error}
   * Cuando la ciudad está inactiva o no pertenece al departamento indicado.
   *
   * @throws {Error}
   * Cuando el departamento no pertenece al país indicado.
   */
  async updateLocation(dto: UserLocationDto): Promise<void> {
    this.validateRequiredIds(dto);

    const { countryId, departmentId, cityId, userId } = dto;

    // 1. Validar País
    this.validateCountry(countryId!);

    // 2. Validar Departamento
    this.validateDepartment(departmentId!, countryId!);

    // 3. Validar Ciudad
    this.validateCity(cityId, departmentId);

    // 4. Validar RN-006: la ciudad debe tener al menos un cine activo
    this.checkCityHasCinemas(cityId!);

    // 5. Actualizar el perfil del usuario utilizando el repositorio
    if (!userId) return;

    const profile = await this.profileRepository.findByUserId(userId);

    if (profile) {
      await this.profileRepository.update(profile.id, { cityId });
    }
  }

  /**
   * Valida que los identificadores geográficos obligatorios estén presentes.
   */
  private validateRequiredIds(ids: {
    countryId?: number;
    departmentId?: number;
    cityId?: number;
  }): void {
    if (!ids.countryId) throw new LocationValidationError('El país es obligatorio.');
    if (!ids.departmentId) throw new LocationValidationError('El departamento es obligatorio.');
    if (!ids.cityId) throw new LocationValidationError('La ciudad es obligatoria.');
  }

  /**
   * Valida la existencia y estado activo del país.
   */
  private async validateCountry(countryId: number): Promise<void> {
    const country = await this.countryRepository.findById(countryId);
    if (!country) throw new CountryNotFoundError();
    if (!country.isActive) throw new CountryInactiveError();
  }

  /**
   * Valida la existencia, estado activo y pertenencia al país del departamento.
   */
  private async validateDepartment(departmentId: number, countryId: number): Promise<void> {
    const department = await this.departmentRepository.findById(departmentId);
    if (!department) throw new DepartmentNotFoundError();
    if (!department.isActive) throw new DepartmentInactiveError();
    if (department.countryId !== countryId) throw new DepartmentCountryMismatchError();
  }

  /**
   * Valida la existencia, estado activo y pertenencia al departamento de la ciudad.
   */
  private async validateCity(cityId: number, departmentId: number): Promise<void> {
    const city = await this.cityRepository.findById(cityId);
    if (!city) throw new CityNotFoundError();
    if (!city.isActive) throw new CityInactiveError();
    if (city.departmentId !== departmentId) throw new CityDepartmentMismatchError();
  }

  private async checkCityHasCinemas(cityId: number) {
    const activeCinema = await this.cinemaRepository.findByCityId(cityId, true);
    if (!activeCinema) {
      throw new CityWithoutCinemaError();
    }
  }
}

/**
 * Instancia única del servicio de usuarios utilizada por la aplicación.
 *
 * @constant
 * @type {UserService}
 */
export default UserService;
