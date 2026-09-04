// app/src/controllers/user.controller.ts

import { Request, Response } from 'express';

import { IUserService } from '../services/interfaces/user.service.interface.js';

import { asyncHandler } from '../middleware/async-handler.js';

/**
 * ============================================================================
 * Controlador de Usuarios
 * ============================================================================
 *
 * Este controlador gestiona las solicitudes HTTP relacionadas con la entidad
 * `User`.
 *
 * Su única responsabilidad es actuar como intermediario entre el cliente
 * (HTTP) y la capa de servicios, delegando toda la lógica de negocio al
 * `UserService`.
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
export class UserController {
  /**
   * Servicio encargado de ejecutar la lógica de negocio relacionada con
   * los usuarios.
   */
  constructor(private readonly userService: IUserService) {}

  /**
   * ==========================================================================
   * Obtiene el listado completo de usuarios.
   * ==========================================================================
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
   * @returns {Promise<void>}
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
  public getUsers = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const users = await this.userService.findAll();

    res.status(200).json(users);
  });

  /**
   * ==========================================================================
   * Actualiza o valida la ubicación geográfica seleccionada por el usuario.
   * ==========================================================================
   *
   * Obtiene los identificadores de país, departamento y ciudad enviados
   * mediante el body de la petición y delega la operación al servicio.
   *
   * Cuando existe un usuario autenticado, su identificador se obtiene desde
   * `req.user.sub`.
   *
   * @async
   *
   * @param {Request} req
   * Objeto de la petición HTTP.
   *
   * Espera recibir en el body:
   * @example
   * {
   *   "countryId": 1,
   *   "departmentId": 5,
   *   "cityId": 23
   * }
   *
   * @param {Response} res
   * Objeto utilizado para construir la respuesta HTTP.
   *
   * @returns {Promise<void>}
   *
   * Posibles respuestas:
   *
   * - **200 OK**
   *   Ubicación seleccionada y validada correctamente.
   *
   * - **400 Bad Request**
   *   Datos de ubicación inválidos.
   *
   * - **404 Not Found**
   *   País, departamento o ciudad inexistente.
   *
   * - **500 Internal Server Error**
   *   Error inesperado durante el procesamiento.
   */
  public updateLocation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { countryId, departmentId, cityId } = req.body;

    /**
     * Obtiene el usuario autenticado previamente establecido por el
     * middleware de autenticación.
     */
    const authenticatedUser = (req as Request & { user?: { sub: number } }).user;

    /**
     * El identificador del usuario autenticado tiene prioridad.
     *
     * El fallback hacia `req.body.userId` puede utilizarse cuando el endpoint
     * permita explícitamente recibir el identificador mediante el body.
     */
    const userId = authenticatedUser ? authenticatedUser.sub : req.body.userId;

    await this.userService.updateLocation({
      countryId: Number.parseInt(countryId),
      departmentId: Number.parseInt(departmentId),
      cityId: Number.parseInt(cityId),
      userId: Number.parseInt(userId),
    });

    res.status(200).json({
      message: 'Ubicación seleccionada y validada correctamente.',
      location: {
        countryId: Number.parseInt(countryId),
        departmentId: Number.parseInt(departmentId),
        cityId: Number.parseInt(cityId),
      },
    });
  });
}
