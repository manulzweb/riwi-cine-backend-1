// app/src/services/user.service.ts

import User from '../models/user.model';
import { CreateUserDto } from '../dto/create-user.dto';
import repository from '../repositories/user.repository';
import { IUserService } from './interfaces/user.service.interface';
import bcrypt from 'bcrypt';

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
  async create(dto: CreateUserDto): Promise<User> {
    /**
     * Ejemplo de regla de negocio:
     *
     * Antes de crear un usuario podríamos validar que el correo
     * electrónico no se encuentre registrado.
     **/
    if(dto.email !== dto.confirmEmail) {
      throw new Error("Los correos no coinciden");
    }

    if(dto.password !== dto.confirmPassword) {
      throw new Error("Las contraseñas no coinciden");
    }

    const existingUser = await repository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('El correo electrónico ya se encuentra registrado.');
    }

    if(dto.password.length < 10){
      throw new Error("La contraseña debe tener al menos 10 caracteres");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d])(?=.*[@$!%*?&.#]_-).{10,}$/;
    
    if(!passwordRegex.test(dto.password)) {
      throw new Error("La contraseña debe tener al menos una mayúscula, una minúscula, un número y un caracter especial");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    /**
     * También podríamos:
     *  - Encriptar la contraseña.
     *  - Asignar un rol por defecto.
     *  - Registrar la operación en una bitácora.
     *  - Enviar un correo de bienvenida.
     */

    return await repository.create(dto);
  }

  /**
   * Recupera todos los usuarios registrados en el sistema.
   *
   * Este método delega la consulta al repositorio de usuarios, el cual es el
   * responsable de interactuar con la base de datos. En esta capa podrían
   * incorporarse reglas de negocio adicionales, como filtros, paginación,
   * ordenamiento o transformaciones de los datos antes de ser enviados al
   * controlador.
   *
   * @async
   * @returns {Promise<User[]>} Promesa que resuelve con un arreglo de objetos
   *                            de tipo {@link User} que representan los usuarios
   *                            encontrados en la base de datos.
   *
   * @example
   * const users = await userService.findAll();
   *
   * console.log(users);
   * // [
   * //   {
   * //     id: 1,
   * //     name: "David",
   * //     email: "david@example.com"
   * //   }
   * // ]
   */
  async findAll(): Promise<User[]> {
    return await repository.findAll();
  }
}

export default new UserService();
