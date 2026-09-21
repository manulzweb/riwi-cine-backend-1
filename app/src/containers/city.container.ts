// app/src/containers/city.container.ts

import { CityController } from '../controllers/city.controller.js';
import CityRepository from '../repositories/city.repository.js';
import CityService from '../services/city.service.js';

/**
 * ============================================================================
 * Contenedor de Inyección de Dependencias — Ciudades (City)
 * ============================================================================
 *
 * Este módulo actúa como el Composition Root para el módulo de ciudades.
 * Se encarga de instanciar e interconectar (wiring) las capas de:
 * Repositorio -> Servicio -> Controlador siguiendo los principios SOLID y
 * el patrón de Inversión de Control (IoC) con Inyección de Dependencias (DI).
 *
 * Responsabilidades:
 *  - Instanciar la implementación concreta `CityRepository`.
 *  - Inyectar la instancia del repositorio en `CityService`.
 *  - Instanciar `CityController` inyectando el servicio correspondiente.
 *  - Exportar la instancia del controlador lista para su uso en las rutas Express.
 *
 * Este contenedor NO debe:
 *  - Contener lógica de negocio ni manipulación de datos.
 *  - Manejar peticiones o respuestas HTTP directamente.
 *  - Ejecutar consultas a la base de datos o llamadas Sequelize.
 *
 * Arquitectura:
 *
 * Cliente HTTP / Rutas Express (`city.routes.ts`)
 *      │
 * CityContainer (Composition Root / Wiring)
 *      ├──> CityController (Capa de Presentación / HTTP)
 *      │       │
 *      │       ▼
 *      └──> CityService (Capa de Lógica de Negocio)
 *              │
 *              ▼
 *           CityRepository (Capa de Acceso a Datos / Sequelize)
 *              │
 *              ▼
 *           PostgreSQL (Tabla `cities`)
 * ============================================================================
 */

/**
 * Instancia del repositorio de ciudades.
 *
 * Encapsula el acceso a datos y las operaciones directas sobre el modelo `City`
 * de Sequelize (por ejemplo, búsqueda por ID y filtrado por departamento).
 *
 * @type {CityRepository}
 *
 * @example
 * ```ts
 * const cities = await cityRepository.findByDepartmentId(1);
 * ```
 *
 * @business
 * Provee la abstracción de persistencia para ciudades, aislando los detalles de
 * base de datos de las reglas de negocio del servicio.
 */
const cityRepository = new CityRepository();

/**
 * Instancia del servicio de ciudades.
 *
 * Contiene la lógica de negocio y las operaciones del dominio de ciudades,
 * consumiendo las operaciones de persistencia a través de `ICityRepository`.
 *
 * @type {CityService}
 * @param {ICityRepository} cityRepository Repositorio de acceso a datos de ciudades.
 *
 * @example
 * ```ts
 * const cities = await cityService.findByDepartmentId(1);
 * ```
 *
 * @business
 * Garantiza que las consultas de ciudades por departamento cumplan con las reglas
 * de negocio de la aplicación antes de retornar la información.
 */
const cityService = new CityService(cityRepository);

/**
 * Instancia del controlador de ciudades lista para vincularse con Express Router.
 *
 * Recibe las solicitudes HTTP, valida los parámetros de entrada y delega
 * la ejecución al `CityService`, retornando las respuestas formateadas.
 *
 * @type {CityController}
 * @param {ICityService} cityService Servicio encargado de la lógica de negocio de ciudades.
 *
 * @returns {CityController} Instancia singleton del controlador de ciudades.
 *
 * @throws {Error} Propaga los errores no controlados al middleware global de errores (`errorHandler`).
 *
 * @example
 * ```ts
 * // En app/src/routes/city.routes.ts
 * import { Router } from 'express';
 * import { cityController } from '../containers/city.container.js';
 *
 * const router = Router();
 * router.get('/:departmentId', cityController.getCities);
 * export default router;
 * ```
 *
 * @security
 * - No expone detalles internos de la base de datos ni consultas SQL en respuestas.
 * - Los identificadores de departamento son validados antes de procesar la solicitud.
 */
export const cityController = new CityController(cityService);
