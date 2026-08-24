// app/src/controllers/user.controller.ts

import { Request, Response } from 'express';

import userService from '../services/user.service';

/**
 * ============================================================================
 * Controlador de Usuarios
 * ============================================================================
 *
 * Este controlador gestiona las solicitudes HTTP relacionadas con la entidad `User`.
 *
 * Su única responsabilidad es actuar como intermediario entre el cliente
 * (HTTP) y la capa de servicios, delegando toda la lógica de negocio al `UserService`.
 *
 * Responsabilidades:
 *  - Recibir y procesar las solicitudes HTTP.
 *  - Obtener la información enviada por el cliente.
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
 * UserController
 *      │
 * UserService
 *      │
 * UserRepository
 *      │
 * Sequelize
 *      │
 * PostgreSQL
 * ============================================================================
 */

/**
 * Crea un nuevo usuario.
 *
 * Recibe la información enviada por el cliente, construye el DTO de creación
 * y delega la operación al servicio correspondiente.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Espera recibir en el body:
 * @example
 * {
 *   "name": "David Mtz",
 *   "email": "david@example.com"
 * }
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP.
 *
 * @returns {Promise<Response>}
 * Promesa que resuelve una respuesta HTTP.
 *
 * Posibles respuestas:
 *
 * - **201 Created**
 *   Usuario creado correctamente.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante el procesamiento.
 *
 * @throws {Error}
 * Cualquier excepción generada por la capa de servicios será capturada
 * y retornada como una respuesta HTTP con código 500.
 */
export const createUser = async (req: Request, res: Response): Promise<Response> => {
  return res.status(400).json({
    error:
      'Para registrar usuarios y crear su membresía digital, utilice el endpoint POST /api/auth/register.',
  });
};

/**
 * Obtiene el listado completo de usuarios.
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
 *   Lista de usuarios obtenida correctamente.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante la consulta.
 *
 * @example
 * [
 *   {
 *     "id": 1,
 *     "name": "David",
 *     "email": "david@example.com"
 *   }
 * ]
 */
export const getUsers = async (_req: Request, res: Response): Promise<Response> => {
  try {
    // Solicita la información al servicio.
    const users = await userService.findAll();

    // Retorna la colección de usuarios.
    return res.status(200).json(users);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({
      error: errorMessage,
    });
  }
};

/**
 * Actualiza o valida la ubicación geográfica seleccionada por el usuario.
 */
export const updateLocation = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { countryId, departmentId, cityId } = req.body;
    const authenticatedUser = (req as Request & { user?: { sub: number } }).user;
    const userId = authenticatedUser ? authenticatedUser.sub : req.body.userId;

    await userService.updateLocation({
      countryId: countryId ? Number(countryId) : 0,
      departmentId: departmentId ? Number(departmentId) : 0,
      cityId: cityId ? Number(cityId) : 0,
      userId: userId ? Number(userId) : undefined,
    });

    return res.status(200).json({
      message: 'Ubicación seleccionada y validada correctamente.',
      location: {
        countryId,
        departmentId,
        cityId,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(400).json({
      error: errorMessage,
    });
  }
};
