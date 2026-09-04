// app/src/controllers/department.controller.ts

import { Request, Response } from 'express';

import { IDepartmentService } from '../services/interfaces/department.service.interface.js';

import { asyncHandler } from '../middleware/async-handler.js';

/**
 * ============================================================================
 * Controlador de Departamentos
 * ============================================================================
 *
 * Este controlador gestiona las solicitudes HTTP relacionadas con la entidad `Department`.
 *
 * Su única responsabilidad es actuar como intermediario entre el cliente
 * (HTTP) y la capa de servicios, delegando toda la lógica de negocio al `DepartmentService`.
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
 * DepartmentController
 *      │
 * DepartmentService
 *      │
 * DepartmentRepository
 *      │
 * Sequelize
 *      │
 * PostgreSQL
 * ============================================================================
 */
export class DepartmentController {
  /**
   * Servicio encargado de ejecutar la lógica de negocio relacionada con
   * los departamentos.
   */
  constructor(private readonly departmentService: IDepartmentService) {}

  /**
   * ==========================================================================
   * Obtiene el listado de departamentos pertenecientes a un país.
   * ==========================================================================
   *
   * Convierte el parámetro de ruta a entero, delega la consulta al servicio
   * filtrando por país y retorna la colección de departamentos.
   *
   * @async
   *
   * @param {Request} req
   * Objeto de la petición HTTP.
   *
   * Espera recibir en params:
   * @example
   * GET /api/departments/1
   * req.params.countryId = "1"
   *
   * @param {Response} res
   * Objeto utilizado para construir la respuesta HTTP.
   *
   * @returns {Promise<void>}
   *
   * Posibles respuestas:
   *
   * - **200 OK**
   *   Lista de departamentos obtenida correctamente (puede ser vacía).
   *
   * - **400 Bad Request**
   *   ID de país inválido.
   *
   * - **500 Internal Server Error**
   *   Error inesperado durante la consulta.
   */
  public getDepartments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const countryId = Number.parseInt(req.params.countryId, 10);

    if (Number.isNaN(countryId)) {
      res.status(400).json({ error: 'ID de país inválido.' });
      return;
    }

    const departments = await this.departmentService.findByCountryId(countryId);
    res.status(200).json(departments);
  });
}
