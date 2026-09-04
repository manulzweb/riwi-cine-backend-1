// app/src/controllers/city.controller.ts

import { Request, Response } from 'express';

import { ICityService } from '../services/interfaces/city.service.interface.js';

import { asyncHandler } from '../middleware/async-handler.js';

/**
 * ============================================================================
 * Controlador de Ciudades
 * ============================================================================
 *
 * Este controlador gestiona las solicitudes HTTP relacionadas con la entidad `City`.
 *
 * Su única responsabilidad es actuar como intermediario entre el cliente
 * (HTTP) y la capa de servicios, delegando toda la lógica de negocio al `CityService`.
 *
 * Responsabilidades:
 *  - Recibir y procesar las solicitudes HTTP.
 *  - Obtener y normalizar los parámetros de ruta enviados por el cliente.
 *  - Invocar el servicio correspondiente.
 *  - Construir la respuesta HTTP.
 *  - Retornar los códigos de estado apropiados.
 *
 * Este controlador NO debe:
 *  - Contener reglas de negocio.
 *  - Acceder directamente a la base de datos.
 *  - Ejecutar consultas mediante Sequelize.
 *  - Realizar validaciones complejas del dominio.
 *
 * Arquitectura:
 *
 * Cliente HTTP
 *      │
 * CityController
 *      │
 * CityService
 *      │
 * CityRepository
 *      │
 * Sequelize
 *      │
 * PostgreSQL
 * ============================================================================
 */
export class CityController {
  /**
   * Servicio encargado de ejecutar la lógica de negocio relacionada con
   * las ciudades.
   */
  constructor(private readonly cityService: ICityService) {}

  /**
   * ==========================================================================
   * Obtiene el listado de ciudades pertenecientes a un departamento.
   * ==========================================================================
   *
   * Convierte el parámetro de ruta a entero, delega la consulta al servicio
   * filtrando por departamento y retorna la colección de ciudades.
   *
   * @async
   *
   * @param {Request} req
   * Objeto de la petición HTTP.
   *
   * Espera recibir en params:
   * @example
   * GET /api/cities/5
   * req.params.departmentId = "5"
   *
   * @param {Response} res
   * Objeto utilizado para construir la respuesta HTTP.
   *
   * @returns {Promise<void>}
   *
   * Posibles respuestas:
   *
   * - **200 OK**
   *   Lista de ciudades obtenida correctamente (puede ser vacía).
   *
   * - **400 Bad Request**
   *   ID de departamento inválido.
   *
   * - **500 Internal Server Error**
   *   Error inesperado durante la consulta.
   */
  public getCities = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const departmentId = Number.parseInt(req.params.departmentId, 10);

    if (Number.isNaN(departmentId)) {
      res.status(400).json({ error: 'ID de departamento inválido.' });
      return;
    }

    const cities = await this.cityService.findByDepartmentId(departmentId);
    res.status(200).json(cities);
  });
}
