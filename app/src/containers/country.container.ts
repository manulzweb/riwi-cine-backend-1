// app/src/containers/country.container.ts

import { CountryController } from '../controllers/country.controller.js';
import CountryRepository from '../repositories/country.repository.js';
import CountryService from '../services/country.service.js';

/**
 * ============================================================================
 * Contenedor de Inyección de Dependencias — Países (Country)
 * ============================================================================
 *
 * Este módulo actúa como el Composition Root para el módulo de países.
 * Se encarga de instanciar e interconectar (wiring) las capas de:
 * Repositorio -> Servicio -> Controlador siguiendo los principios SOLID y
 * el patrón de Inversión de Control (IoC) con Inyección de Dependencias (DI).
 *
 * Responsabilidades:
 *  - Instanciar la implementación concreta `CountryRepository`.
 *  - Inyectar la instancia del repositorio en `CountryService`.
 *  - Instanciar `CountryController` inyectando el servicio correspondiente.
 *  - Exportar la instancia del controlador lista para su uso en las rutas Express.
 *
 * Este contenedor NO debe:
 *  - Contener lógica de negocio ni manipulación de datos.
 *  - Manejar peticiones o respuestas HTTP directamente.
 *  - Ejecutar consultas a la base de datos o llamadas Sequelize.
 *
 * Arquitectura:
 *
 * Cliente HTTP / Rutas Express (`country.routes.ts`)
 *      │
 * CountryContainer (Composition Root / Wiring)
 *      ├──> CountryController (Capa de Presentación / HTTP)
 *      │       │
 *      │       ▼
 *      └──> CountryService (Capa de Lógica de Negocio)
 *              │
 *              ▼
 *           CountryRepository (Capa de Acceso a Datos / Sequelize)
 *              │
 *              ▼
 *           PostgreSQL (Tabla `countries`)
 * ============================================================================
 */

/**
 * Instancia del repositorio de países.
 *
 * Encapsula el acceso a datos y las operaciones directas sobre el modelo `Country`
 * de Sequelize (por ejemplo, listado completo de países activos y búsqueda por ID).
 *
 * @type {CountryRepository}
 *
 * @example
 * ```ts
 * const countries = await countryRepository.findAll();
 * ```
 *
 * @business
 * Provee la abstracción de persistencia para los países, desacoplando los modelos
 * de Sequelize de las capas superiores.
 */
const countryRepository = new CountryRepository();

/**
 * Instancia del servicio de países.
 *
 * Contiene la lógica de negocio y las reglas del dominio de países,
 * coordinando las consultas a través de `ICountryRepository`.
 *
 * @type {CountryService}
 * @param {ICountryRepository} countryRepository Repositorio de acceso a datos de países.
 *
 * @example
 * ```ts
 * const countries = await countryService.findAll();
 * ```
 *
 * @business
 * Centraliza la obtención y validación del catálogo de países disponibles
 * en la plataforma.
 */
const countryService = new CountryService(countryRepository);

/**
 * Instancia del controlador de países lista para vincularse con Express Router.
 *
 * Recibe las solicitudes HTTP, delega la obtención del catálogo de países
 * al `CountryService` y retorna la respuesta serializada al cliente.
 *
 * @type {CountryController}
 * @param {ICountryService} countryService Servicio encargado de la lógica de negocio de países.
 *
 * @returns {CountryController} Instancia singleton del controlador de países.
 *
 * @throws {Error} Propaga los errores no controlados al middleware global de errores (`errorHandler`).
 *
 * @example
 * ```ts
 * // En app/src/routes/country.routes.ts
 * import { Router } from 'express';
 * import { countryController } from '../containers/country.container.js';
 *
 * const router = Router();
 * router.get('/', countryController.getCountries);
 * export default router;
 * ```
 *
 * @security
 * - No expone detalles internos ni credenciales de conexión a la base de datos.
 * - Utiliza `asyncHandler` para garantizar el manejo seguro y consistente de excepciones.
 */
export const countryController = new CountryController(countryService);
