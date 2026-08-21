// app/src/controllers/membership.controller.ts

import { Request, Response } from 'express';
import { User, Membership, MembershipLevel, MembershipStatus } from '../models';
import { generateMembershipCode } from '../utils/crypto.util';

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

    // Generate unique membership code with a bounded number of attempts
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
