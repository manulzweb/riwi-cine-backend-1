// app/src/controllers/city.controller.ts

import { Request, Response } from 'express';
import cityService from '../services/city.service';

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

/**
 * Obtiene el listado de ciudades pertenecientes a un departamento.
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
 * GET /api/cities/department/5
 * req.params.departmentId = "5"
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
 *   Lista de ciudades obtenida correctamente (puede ser vacía).
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 *
 * @throws {Error}
 * Cualquier excepción generada por la capa de servicios será capturada
 * y retornada como una respuesta HTTP con código 500.
 */
export const getCities = async (req: Request, res: Response): Promise<Response> => {
  try {
    const departmentId = parseInt(req.params.departmentId, 10);
    const cities = await cityService.findByDepartmentId(departmentId);
    return res.status(200).json(cities);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};
