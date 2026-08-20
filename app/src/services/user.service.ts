import User from '../models/user.model';
import { City, Department, Country, Profile } from '../models';
import { UserLocationDto } from '../dto/request/user-location.dto';
import repository from '../repositories/user.repository';
import { IUserService } from './interfaces/user.service.interface';

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
 *
 * @business
 * Las validaciones relacionadas con la ubicación del usuario garantizan
 * que la ciudad pertenezca al departamento seleccionado y que el
 * departamento pertenezca al país seleccionado.
 */
class UserService implements IUserService {
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
    return await repository.findAll();
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
    const { countryId, departmentId, cityId, userId } = dto;

    if (!countryId) {
      throw new Error('El país es obligatorio.');
    }

    if (!departmentId) {
      throw new Error('El departamento es obligatorio.');
    }

    if (!cityId) {
      throw new Error('La ciudad es obligatoria.');
    }

    // 1. Validar País
    const country = await Country.findByPk(countryId);

    if (!country) {
      throw new Error('El país seleccionado no existe.');
    }

    // 2. Validar Departamento
    const department = await Department.findByPk(departmentId);

    if (!department) {
      throw new Error('El departamento seleccionado no existe.');
    }

    if (department.countryId !== countryId) {
      throw new Error('El departamento no pertenece al país seleccionado.');
    }

    // 3. Validar Ciudad
    const city = await City.findByPk(cityId);

    if (!city) {
      throw new Error('La ciudad seleccionada no existe.');
    }

    if (!city.isActive) {
      throw new Error('La ciudad seleccionada no está activa.');
    }

    if (city.departmentId !== departmentId) {
      throw new Error('La ciudad no pertenece al departamento seleccionado.');
    }

    // 4. Actualizar el perfil del usuario
    if (userId) {
      const profile = await Profile.findOne({
        where: { userId },
      });

      if (profile) {
        await profile.update({ cityId });
      }
    }
  }
}

/**
 * Instancia única del servicio de usuarios utilizada por la aplicación.
 *
 * @constant
 * @type {UserService}
 */
export default new UserService();
