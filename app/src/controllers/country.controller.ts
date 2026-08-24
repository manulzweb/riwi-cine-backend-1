// app/src/controllers/country.controller.ts

import { Request, Response } from 'express';
import countryService from '../services/country.service';

/**
 * ============================================================================
 * Controlador de Países
 * ============================================================================
 *
 * Este controlador gestiona las solicitudes HTTP relacionadas con la entidad `Country`.
 *
 * Su única responsabilidad es actuar como intermediario entre el cliente
 * (HTTP) y la capa de servicios, delegando toda la lógica de negocio al `CountryService`.
 *
 * Responsabilidades:
 *  - Recibir y procesar las solicitudes HTTP.
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
 * CountryController
 *      │
 * CountryService
 *      │
 * CountryRepository
 *      │
 * Sequelize
 *      │
 * PostgreSQL
 * ============================================================================
 */

/**
 * Obtiene el listado completo de países.
 *
 * Delega la consulta a la capa de servicios, la cual será responsable de
 * aplicar cualquier regla de negocio antes de consultar el repositorio.
 *
 * @async
 *
 * @param {Request} _req
 * Objeto de la petición HTTP.
 *
 * En este endpoint no se utiliza, por ello se antepone "_" al nombre de la
 * variable para indicar explícitamente que el parámetro es requerido por
 * Express pero no será utilizado.
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
 *   Lista de países obtenida correctamente.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 *
 * @throws {Error}
 * Cualquier excepción generada por la capa de servicios será capturada
 * y retornada como una respuesta HTTP con código 500.
 */
export const getCountries = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const countries = await countryService.findAll();
    return res.status(200).json(countries);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};
