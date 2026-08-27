// app/src/controllers/health.controller.ts

import { Request, Response } from 'express';
import sequelize from '../config/database.js';

/**
 * ============================================================================
 * Controlador de Salud (Health Check)
 * ============================================================================
 *
 * Este controlador gestiona las solicitudes HTTP destinadas a verificar el
 * estado operativo del servicio y de sus dependencias principales.
 *
 * Su única responsabilidad es actuar como intermediario entre el cliente
 * (HTTP) y la capa de infraestructura, consultando directamente la conexión
 * a la base de datos mediante Sequelize para determinar si el sistema está
 * operativo.
 *
 * Responsabilidades:
 *  - Recibir y procesar las solicitudes HTTP de verificación de estado.
 *  - Construir el informe de salud con información del proceso y los servicios.
 *  - Verificar la conectividad con la base de datos.
 *  - Retornar los códigos de estado apropiados.
 *
 * Este controlador NO debe:
 *  - Contener reglas de negocio.
 *  - Ejecutar consultas de dominio mediante Sequelize.
 *
 * Arquitectura:
 *
 * Cliente HTTP
 *      │
 * HealthController
 *      │
 * Sequelize (authenticate)
 *      │
 * PostgreSQL
 * ============================================================================
 */

/**
 * Verifica el estado de salud del servicio y de la base de datos.
 *
 * Construye un informe con el estado general, el tiempo de actividad del
 * proceso y la marca de tiempo actual. Luego autentica la conexión con la
 * base de datos mediante `sequelize.authenticate()`:
 *  - Si la conexión es exitosa, responde con el estado `OK` y la base de
 *    datos marcada como `UP`.
 *  - Si falla, responde con el estado `DOWN` y el detalle del error de la
 *    base de datos.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * En este endpoint no se utiliza; Express lo requiere en la firma pero
 * el handler no hace uso de él.
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
 *   El servicio y la base de datos están operativos (`status: OK`,
 *   `database: UP`).
 *
 * - **500 Internal Server Error**
 *   No fue posible conectar con la base de datos (`status: DOWN`, incluye
 *   el mensaje del error en `services.database`).
 *
 * @throws {Error}
 * Cualquier error de conexión a la base de datos será capturado internamente
 * y retornado como una respuesta HTTP con código 500.
 */
export const checkHealth = async (req: Request, res: Response): Promise<Response> => {
  const healthInfo = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: 'UP',
    },
  };

  try {
    await sequelize.authenticate();
    return res.status(200).json(healthInfo);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';

    return res.status(500).json({
      status: 'DOWN',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: `DOWN: ${message}`,
      },
    });
  }
};
