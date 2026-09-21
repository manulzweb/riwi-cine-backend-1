// app/src/containers/department.container.ts

import { DepartmentController } from '../controllers/department.controller.js';
import DepartmentRepository from '../repositories/department.repository.js';
import DepartmentService from '../services/department.service.js';

/**
 * ============================================================================
 * Contenedor de Inyección de Dependencias — Departamentos (Department)
 * ============================================================================
 *
 * Este módulo actúa como el Composition Root para el módulo de departamentos.
 * Se encarga de instanciar e interconectar (wiring) las capas de:
 * Repositorio -> Servicio -> Controlador siguiendo los principios SOLID y
 * el patrón de Inversión de Control (IoC) con Inyección de Dependencias (DI).
 *
 * Responsabilidades:
 *  - Instanciar la implementación concreta `DepartmentRepository`.
 *  - Inyectar la instancia del repositorio en `DepartmentService`.
 *  - Instanciar `DepartmentController` inyectando el servicio correspondiente.
 *  - Exportar la instancia del controlador lista para su uso en las rutas Express.
 *
 * Este contenedor NO debe:
 *  - Contener lógica de negocio ni validaciones de dominio.
 *  - Manejar peticiones o respuestas HTTP directamente.
 *  - Ejecutar consultas a la base de datos o llamadas Sequelize.
 *
 * Arquitectura:
 *
 * Cliente HTTP / Rutas Express (`department.routes.ts`)
 *      │
 * DepartmentContainer (Composition Root / Wiring)
 *      ├──> DepartmentController (Capa de Presentación / HTTP)
 *      │       │
 *      │       ▼
 *      └──> DepartmentService (Capa de Lógica de Negocio)
 *              │
 *              ▼
 *           DepartmentRepository (Capa de Acceso a Datos / Sequelize)
 *              │
 *              ▼
 *           PostgreSQL (Tabla `departments`)
 * ============================================================================
 */

/**
 * Instancia del repositorio de departamentos.
 *
 * Encapsula el acceso a datos y las operaciones directas sobre el modelo `Department`
 * de Sequelize (por ejemplo, búsqueda por ID y filtrado por país).
 *
 * @type {DepartmentRepository}
 *
 * @example
 * ```ts
 * const departments = await departmentRepository.findByCountryId(1);
 * ```
 *
 * @business
 * Provee la abstracción de persistencia para los departamentos, aislando el
 * acceso a datos del resto de capas.
 */
const departmentRepository = new DepartmentRepository();

/**
 * Instancia del servicio de departamentos.
 *
 * Contiene la lógica de negocio y reglas del dominio de departamentos,
 * consumiendo las operaciones de persistencia a través de `IDepartmentRepository`.
 *
 * @type {DepartmentService}
 * @param {IDepartmentRepository} departmentRepository Repositorio de acceso a datos de departamentos.
 *
 * @example
 * ```ts
 * const departments = await departmentService.findByCountryId(1);
 * ```
 *
 * @business
 * Coordina la consulta y validación de departamentos asociados a un país
 * específico antes de entregar la respuesta.
 */
const departmentService = new DepartmentService(departmentRepository);

/**
 * Instancia del controlador de departamentos lista para vincularse con Express Router.
 *
 * Recibe las solicitudes HTTP, extrae y valida el parámetro de país (`countryId`),
 * delega la consulta al `DepartmentService` y responde con el listado correspondiente.
 *
 * @type {DepartmentController}
 * @param {IDepartmentService} departmentService Servicio encargado de la lógica de negocio de departamentos.
 *
 * @returns {DepartmentController} Instancia singleton del controlador de departamentos.
 *
 * @throws {Error} Propaga los errores no controlados al middleware global de errores (`errorHandler`).
 *
 * @example
 * ```ts
 * // En app/src/routes/department.routes.ts
 * import { Router } from 'express';
 * import { departmentController } from '../containers/department.container.js';
 *
 * const router = Router();
 * router.get('/:countryId', departmentController.getDepartments);
 * export default router;
 * ```
 *
 * @security
 * - Valida y parsea numéricamente los identificadores de ruta para evitar inyecciones.
 * - No expone detalles internos de la base de datos ni mensajes de error no sanitizados.
 */
export const departmentController = new DepartmentController(departmentService);
