// app/src/containers/movie.container.ts

import { MovieController } from '../controllers/movie.controller.js';
import MovieRepository from '../repositories/movie.repository.js';
import MovieService from '../services/movie.service.js';

/**
 * ============================================================================
 * Contenedor de Inyección de Dependencias — Películas (Movie)
 * ============================================================================
 *
 * Este módulo actúa como el Composition Root para el módulo de películas.
 * Se encarga de instanciar e interconectar (wiring) las capas de:
 * Repositorio -> Servicio -> Controlador siguiendo los principios SOLID y
 * el patrón de Inversión de Control (IoC) con Inyección de Dependencias (DI).
 *
 * Responsabilidades:
 *  - Instanciar la implementación concreta `MovieRepository`.
 *  - Inyectar la instancia del repositorio en `MovieService`.
 *  - Instanciar `MovieController` inyectando el servicio correspondiente.
 *  - Exportar la instancia del controlador lista para su uso en las rutas Express (`movie.routes.ts`).
 *
 * Este contenedor NO debe:
 *  - Contener lógica de negocio, filtros o transformaciones de datos.
 *  - Manejar peticiones o respuestas HTTP directamente.
 *  - Ejecutar consultas a la base de datos o llamadas Sequelize.
 *
 * Arquitectura:
 *
 * Cliente HTTP / Rutas Express (`movie.routes.ts`)
 *      │
 * MovieContainer (Composition Root / Wiring)
 *      ├──> MovieController (Capa de Presentación / HTTP)
 *      │       │
 *      │       ▼
 *      └──> MovieService (Capa de Lógica de Negocio)
 *              │
 *              ▼
 *           MovieRepository (Capa de Acceso a Datos / Sequelize)
 *              │
 *              ▼
 *           PostgreSQL (Tablas `movies`, `genres`, `formats`, `screenings`, etc.)
 * ============================================================================
 */

/**
 * Instancia del repositorio de películas.
 *
 * Encapsula todas las operaciones de acceso a datos y consultas Sequelize
 * relacionadas con películas: cartelera, próximos estrenos, filtrado multicriterio,
 * búsqueda por identificador y relaciones asociadas (géneros, formatos, clasificaciones).
 *
 * @type {MovieRepository}
 *
 * @example
 * ```ts
 * const movie = await movieRepository.findById(1);
 * const billboard = await movieRepository.findBillboard(1, 10);
 * ```
 *
 * @business
 * Centraliza las consultas directas a la base de datos de películas y optimiza
 * las asociaciones (`includes`) sin filtrar lógica de negocio al exterior.
 */
const movieRepository = new MovieRepository();

/**
 * Instancia del servicio de películas.
 *
 * Contiene las reglas de negocio, validaciones de fechas/estados y orquestación
 * de operaciones para películas, apoyándose en `IMovieRepository`.
 *
 * @type {MovieService}
 * @param {IMovieRepository} movieRepository Repositorio de acceso a datos de películas.
 *
 * @example
 * ```ts
 * const details = await movieService.getMovieDetails(1);
 * const premieres = await movieService.getPremieres(1, 10);
 * ```
 *
 * @business
 * Coordina las reglas de cartelera activa, cálculo de fechas de estreno,
 * filtros avanzados y generación de recomendaciones para los usuarios.
 */
const movieService = new MovieService(movieRepository);

/**
 * Instancia del controlador de películas lista para vincularse con Express Router.
 *
 * Recibe las solicitudes HTTP para los endpoints de películas (cartelera,
 * estrenos, detalles, funciones, recomendaciones, filtros), normaliza parámetros
 * y query strings, delega al `MovieService` y retorna respuestas con códigos HTTP estándar.
 *
 * @type {MovieController}
 * @param {IMovieService} movieService Servicio encargado de la lógica de negocio de películas.
 *
 * @returns {MovieController} Instancia singleton del controlador de películas.
 *
 * @throws {Error} Propaga los errores no controlados al middleware global de errores (`errorHandler`).
 *
 * @example
 * ```ts
 * // En app/src/routes/movie.routes.ts
 * import { Router } from 'express';
 * import { movieController } from '../containers/movie.container.js';
 *
 * const router = Router();
 * router.get('/billboard', movieController.getBillboard);
 * router.get('/premieres', movieController.getPremieres);
 * router.get('/:id', movieController.getMovieDetails);
 * export default router;
 * ```
 *
 * @security
 * - Valida y sanitiza parámetros de consulta y paginación para prevenir sobrecarga y ataques de inyección.
 * - Respeta la encapsulación de datos sensibles del dominio.
 */
export const movieController = new MovieController(movieService);
