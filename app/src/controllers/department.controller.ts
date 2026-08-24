// app/src/controllers/department.controller.ts

import { Request, Response } from 'express';
import departmentService from '../services/department.service';

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

/**
 * Obtiene el listado de departamentos pertenecientes a un país.
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
 * GET /api/departments/country/1
 * req.params.countryId = "1"
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP.
 *
 * @returns {Promise<Response>}
 * Promesa que resuelve una respuesta HTTP.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Lista de departamentos obtenida correctamente (puede ser vacía).
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 *
 * @throws {Error}
 * Cualquier excepción generada por la capa de servicios será capturada
 * y retornada como una respuesta HTTP con código 500.
 */
export const getDepartments = async (req: Request, res: Response): Promise<Response> => {
  try {
    const countryId = parseInt(req.params.countryId, 10);
    const departments = await departmentService.findByCountryId(countryId);
    return res.status(200).json(departments);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};
