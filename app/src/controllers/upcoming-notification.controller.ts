// app/src/controllers/upcoming-notification.controller.ts

import { Request, Response } from 'express';
import upcomingNotificationService from '../services/upcoming-notification.service.js';
import { NotificationUpcomingDto } from '../schemas/notification.schemas.js';

/**
 * ============================================================================
 * Controlador de Notificaciones de Próximos Estrenos
 * ============================================================================
 *
 * Este controlador gestiona las solicitudes HTTP relacionadas con el registro
 * de solicitudes de notificación para próximos estrenos de películas.
 *
 * Su única responsabilidad es actuar como intermediario entre el cliente
 * (HTTP) y la capa de servicios, delegando toda la lógica de negocio al
 * `UpcomingNotificationService`.
 *
 * Responsabilidades:
 *  - Recibir y procesar las solicitudes HTTP.
 *  - Obtener la información enviada por el cliente (validada previamente por
 *    el esquema `NotificationUpcomingDto`).
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
 * UpcomingNotificationController
 *      │
 * UpcomingNotificationService
 *      │
 * UpcomingNotificationRepository
 *      │
 * Sequelize
 *      │
 * PostgreSQL
 * ============================================================================
 */

/**
 * Registra una solicitud de notificación para un próximo estreno.
 *
 * Recibe el DTO validado desde el body, delega el registro al servicio y
 * retorna la confirmación junto con los datos de la solicitud creada.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Espera recibir en el body:
 * @example
 * {
 *   "movieId": 42,
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
 *   Solicitud de notificación registrada correctamente.
 *
 * - **400 Bad Request**
 *   Error durante el registro (datos inválidos o reglas de negocio no
 *   cumplidas reportadas por la capa de servicios).
 *
 * @throws {Error}
 * Cualquier excepción generada por la capa de servicios será capturada
 * y retornada como una respuesta HTTP con código 400.
 */
export const registerUpcomingNotification = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const dto = req.body as NotificationUpcomingDto;
    const result = await upcomingNotificationService.register(dto);

    return res.status(201).json({
      message: 'Solicitud de notificación registrada exitosamente.',
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(400).json({ error: message });
  }
};
