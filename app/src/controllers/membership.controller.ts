// app/src/controllers/membership.controller.ts

import { Request, Response } from 'express';
import { User, Membership, MembershipLevel, MembershipStatus } from '../models';
import { generateMembershipCode } from '../utils/crypto.util';

/**
 * ============================================================================
 * Controlador de Membresías
 * ============================================================================
 *
 * Este controlador gestiona las solicitudes HTTP relacionadas con la entidad
 * `Membership` (membresía digital del usuario).
 *
 * Nota: a diferencia del resto de controladores, este módulo accede
 * directamente a los modelos de Sequelize (`User`, `Membership`,
 * `MembershipLevel`, `MembershipStatus`) en lugar de delegar en una capa de
 * servicios. Se mantiene así por decisiones históricas del proyecto.
 *
 * Responsabilidades:
 *  - Recibir y procesar las solicitudes HTTP.
 *  - Obtener la información enviada por el cliente.
 *  - Validar la existencia de registros y reglas previas a la creación.
 *  - Generar un código único de membresía.
 *  - Construir la respuesta HTTP.
 *
 * Arquitectura (actual, con acceso directo a modelos):
 *
 * Cliente HTTP
 *      │
 * MembershipController
 *      │
 * Modelos Sequelize (User, Membership, MembershipLevel, MembershipStatus)
 *      │
 * PostgreSQL
 * ============================================================================
 */

/**
 * Crea la membresía digital de un usuario.
 *
 * Valida que el usuario exista y que no cuente ya con una membresía activa,
 * resuelve el nivel (`BÁSICA`) y el estado (`Activa`) por defecto, genera un
 * código único de membresía y persiste el nuevo registro.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Espera recibir en el body:
 * @example
 * {
 *   "userId": 7
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
 *   Membresía digital creada correctamente. Devuelve id, código, saldo de
 *   puntos, nivel y estado.
 *
 * - **400 Bad Request**
 *   El ID de usuario es obligatorio o el usuario ya cuenta con una membresía
 *   digital activa.
 *
 * - **404 Not Found**
 *   El usuario indicado no existe.
 *
 * - **500 Internal Server Error**
 *   No existe el nivel o estado de membresía por defecto, no se pudo generar
 *   un código único tras los intentos permitidos, u ocurrió un error
 *   inesperado durante el procesamiento.
 *
 * @throws {Error}
 * Cualquier excepción generada durante la operación será capturada
 * y retornada como una respuesta HTTP con código 500.
 */
export const createMembership = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'El ID de usuario es obligatorio' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const existingMembership = await Membership.findOne({ where: { userId } });
    if (existingMembership) {
      return res
        .status(400)
        .json({ error: 'El usuario ya cuenta con una membresía digital activa' });
    }

    const defaultLevel = await MembershipLevel.findOne({ where: { name: 'BÁSICA' } });
    if (!defaultLevel) {
      return res
        .status(500)
        .json({ error: 'No existe el nivel de membresía por defecto en el sistema' });
    }

    const defaultStatus = await MembershipStatus.findOne({ where: { name: 'Activa' } });
    if (!defaultStatus) {
      return res
        .status(500)
        .json({ error: 'No existe el estado de membresía por defecto en el sistema' });
    }

    // Genera un código de membresía único con un número acotado de intentos.
    const maxMembershipCodeAttempts = 3;
    let membershipCode = '';
    let isUnique = false;

    for (let attempt = 1; attempt <= maxMembershipCodeAttempts; attempt += 1) {
      const candidateCode = generateMembershipCode();

      const existing = await Membership.findOne({ where: { code: candidateCode } });

      if (!existing) {
        membershipCode = candidateCode;
        isUnique = true;
        break;
      }
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'No se pudo generar un código único de membresía' });
    }

    const membership = await Membership.create({
      userId,
      code: membershipCode,
      levelId: defaultLevel.id,
      statusId: defaultStatus.id,
      pointsBalance: 0,
    });

    return res.status(201).json({
      message: 'Membresía digital creada exitosamente',
      data: {
        id: membership.id,
        userId: membership.userId,
        code: membership.code,
        pointsBalance: membership.pointsBalance,
        level: defaultLevel.name,
        status: defaultStatus.name,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
};
