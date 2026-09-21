// app/src/containers/user.container.ts

import { UserController } from '../controllers/user.controller.js';
import CinemaRepository from '../repositories/cinema.repository.js';
import CityRepository from '../repositories/city.repository.js';
import CountryRepository from '../repositories/country.repository.js';
import DepartmentRepository from '../repositories/department.repository.js';
import ProfileRepository from '../repositories/profile.repository.js';
import UserRepository from '../repositories/user.repository.js';
import UserService from '../services/user.service.js';

/**
 * ============================================================================
 * Contenedor de Inyección de Dependencias — Usuarios (User)
 * ============================================================================
 *
 * Este módulo actúa como el Composition Root para la entidad `User`.
 * Se encarga de instanciar y ensamblar (wiring) todos los repositorios requeridos
 * para la gestión de usuarios, perfiles y validaciones de jerarquía geográfica
 * (país, departamento, ciudad, cine preferido), inyectándolos en el `UserService`
 * y finalmente proveyendo el `UserController` para el enrutador Express.
 *
 * Responsabilidades:
 *  - Instanciar las implementaciones concretas de los 6 repositorios involucrados.
 *  - Inyectar los repositorios en `UserService` mediante su constructor (DI).
 *  - Instanciar `UserController` inyectando `UserService`.
 *  - Exportar la instancia del controlador lista para su uso en las rutas Express (`user.routes.ts`).
 *
 * Este contenedor NO debe:
 *  - Contener lógica de negocio ni validaciones de dominio.
 *  - Manejar peticiones o respuestas HTTP directamente.
 *  - Ejecutar consultas a la base de datos o llamadas Sequelize.
 *
 * Arquitectura:
 *
 * Cliente HTTP / Rutas Express (`user.routes.ts`)
 *      │
 * UserContainer (Composition Root / Wiring)
 *      ├──> UserController (Capa de Presentación / HTTP)
 *      │       │
 *      │       ▼
 *      └──> UserService (Capa de Lógica de Negocio)
 *              │
 *              ├──> UserRepository
 *              ├──> CountryRepository
 *              ├──> DepartmentRepository
 *              ├──> CityRepository
 *              ├──> CinemaRepository
 *              └──> ProfileRepository
 *                      │
 *                      ▼
 *                   PostgreSQL (Tablas `users`, `countries`, `departments`, `cities`, `cinemas`, `profiles`)
 * ============================================================================
 */

/**
 * Instancia del repositorio de usuarios.
 *
 * Encapsula el acceso a datos y las operaciones de consulta y modificación
 * sobre el modelo `User` en la base de datos.
 *
 * @type {UserRepository}
 *
 * @example
 * ```ts
 * const user = await userRepository.findById(1);
 * ```
 *
 * @business
 * Provee la persistencia y recuperación de datos de cuentas de usuario.
 */
const userRepository = new UserRepository();

/**
 * Instancia del repositorio de países.
 *
 * Utilizado por el servicio de usuarios para verificar la existencia y estado activo
 * del país asignado al usuario.
 *
 * @type {CountryRepository}
 *
 * @example
 * ```ts
 * const country = await countryRepository.findById(1);
 * ```
 *
 * @business
 * Permite validar que el país seleccionado por el usuario sea válido y esté activo.
 */
const countryRepository = new CountryRepository();

/**
 * Instancia del repositorio de departamentos.
 *
 * Utilizado por el servicio de usuarios para comprobar la pertenencia del departamento
 * al país seleccionado y su estado de activación.
 *
 * @type {DepartmentRepository}
 *
 * @example
 * ```ts
 * const department = await departmentRepository.findById(1);
 * ```
 *
 * @business
 * Garantiza la consistencia geográfica jerárquica (Departamento -> País).
 */
const departmentRepository = new DepartmentRepository();

/**
 * Instancia del repositorio de ciudades.
 *
 * Utilizado por el servicio de usuarios para validar que la ciudad pertenezca al
 * departamento correspondiente y se encuentre activa en la plataforma.
 *
 * @type {CityRepository}
 *
 * @example
 * ```ts
 * const city = await cityRepository.findById(1);
 * ```
 *
 * @business
 * Garantiza la consistencia geográfica jerárquica (Ciudad -> Departamento).
 */
const cityRepository = new CityRepository();

/**
 * Instancia del repositorio de cines.
 *
 * Utilizado para verificar que la ciudad del usuario disponga de al menos un cine
 * asociado o que el cine preferido pertenezca a la ubicación seleccionada.
 *
 * @type {CinemaRepository}
 *
 * @example
 * ```ts
 * const cinemas = await cinemaRepository.findByCityId(1);
 * ```
 *
 * @business
 * Asegura que los usuarios estén vinculados a ubicaciones con cines disponibles.
 */
const cinemaRepository = new CinemaRepository();

/**
 * Instancia del repositorio de perfiles.
 *
 * Gestiona el acceso a datos de la información complementaria del usuario (perfil,
 * preferencias, ubicación guardada).
 *
 * @type {ProfileRepository}
 *
 * @example
 * ```ts
 * const profile = await profileRepository.findByUserId(1);
 * ```
 *
 * @business
 * Provee la persistencia para los datos demográficos y de perfil de usuario.
 */
const profileRepository = new ProfileRepository();

/**
 * Instancia del servicio de usuarios con todos sus repositorios inyectados.
 *
 * Contiene y orquesta la lógica de negocio del dominio de usuarios, incluyendo
 * la validación de ubicación geográfica, actualización de perfil y consulta de usuarios.
 *
 * @type {UserService}
 * @param {IUserRepository} userRepository Repositorio de usuarios.
 * @param {ICountryRepository} countryRepository Repositorio de países.
 * @param {IDepartmentRepository} departmentRepository Repositorio de departamentos.
 * @param {ICityRepository} cityRepository Repositorio de ciudades.
 * @param {ICinemaRepository} cinemaRepository Repositorio de cines.
 * @param {IProfileRepository} profileRepository Repositorio de perfiles.
 *
 * @example
 * ```ts
 * const users = await userService.getAllUsers();
 * await userService.updateLocation(userId, locationDto);
 * ```
 *
 * @business
 * Valida de forma integral la coherencia geográfica (País -> Departamento -> Ciudad -> Cine)
 * antes de permitir cualquier modificación de perfil de usuario.
 */
const userService = new UserService(
  userRepository,
  countryRepository,
  departmentRepository,
  cityRepository,
  cinemaRepository,
  profileRepository,
);

/**
 * Instancia del controlador de usuarios lista para vincularse con Express Router.
 *
 * Maneja las solicitudes HTTP relacionadas con los usuarios (listado, obtención por ID,
 * actualización de ubicación y perfil), delega al `UserService` y devuelve las respuestas HTTP.
 *
 * @type {UserController}
 * @param {IUserService} userService Servicio con la lógica de negocio de usuarios.
 *
 * @returns {UserController} Instancia singleton del controlador de usuarios.
 *
 * @throws {Error} Propaga las excepciones de negocio y de infraestructura al middleware global de errores (`errorHandler`).
 *
 * @example
 * ```ts
 * // En app/src/routes/user.routes.ts
 * import { Router } from 'express';
 * import { userController } from '../containers/user.container.js';
 *
 * const router = Router();
 * router.get('/', userController.getAllUsers);
 * router.get('/:id', userController.getUserById);
 * router.patch('/:id/location', userController.updateUserLocation);
 * export default router;
 * ```
 *
 * @security
 * - No expone contraseñas, hashes, tokens ni información sensible en las respuestas.
 * - Emplea `asyncHandler` para interceptar y gestionar de forma segura los fallos de ejecución.
 */
export const userController = new UserController(userService);
