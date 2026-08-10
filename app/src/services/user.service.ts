import User from '../models/user.model';
import { City, Department, Country, Profile } from '../models';
import { UserLocationDto } from '../dto/user-location.dto';
import repository from '../repositories/user.repository';
import { IUserService } from './interfaces/user.service.interface';

/**
 * Servicio de Usuarios
 * --------------------
 * Contiene toda la lógica de negocio relacionada con la entidad User.
 *
 * Responsabilidades:
 *  - Validar reglas de negocio.
 *  - Coordinar operaciones entre uno o varios repositorios.
 *  - Orquestar procesos antes y después de persistir información.
 *  - Mantener al controlador libre de lógica de negocio.
 *
 * Ejemplos de reglas de negocio:
 *
 *  Verificar que el correo electrónico no exista antes de crear el usuario.
 *  Validar que el dominio del correo pertenezca a la empresa.
 *  Encriptar la contraseña antes de almacenarla.
 *  Asignar un rol por defecto (Ej. "CLIENTE").
 *  Registrar un log de auditoría de la operación.
 *  Enviar un correo de bienvenida después del registro.
 *  Crear automáticamente un perfil asociado al usuario.
 *
 * El Service conoce las reglas del negocio.
 * El Repository únicamente conoce cómo guardar y consultar información.
 */

class UserService implements IUserService {
  async findAll(): Promise<User[]> {
    return await repository.findAll();
  }

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

    // 1. Validar Ciudad
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

    // 2. Validar Departamento
    const department = await Department.findByPk(departmentId);
    if (!department) {
      throw new Error('El departamento seleccionado no existe.');
    }
    if (department.countryId !== countryId) {
      throw new Error('El departamento no pertenece al país seleccionado.');
    }

    // 3. Validar País
    const country = await Country.findByPk(countryId);
    if (!country) {
      throw new Error('El país seleccionado no existe.');
    }

    // 4. Si hay usuario, actualizar su perfil
    if (userId) {
      const profile = await Profile.findOne({ where: { userId } });
      if (profile) {
        await profile.update({ cityId });
      }
    }
  }
}

export default new UserService();
