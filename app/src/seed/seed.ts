// app/src/seed/seed.ts

import { Role, MembershipLevel, MembershipStatus } from '../models/index.js';
import { ROLES, MEMBERSHIP_LEVELS, MEMBERSHIP_STATUSES } from '../constant/auth.constant.js';

export const runSeed = async (): Promise<void> => {
  // 1. Roles
  await Role.findOrCreate({
    where: { name: ROLES.CLIENT },
    defaults: { name: ROLES.CLIENT, description: 'Usuario final del portal Multicine.' },
  });
  await Role.findOrCreate({
    where: { name: ROLES.ADMIN },
    defaults: { name: ROLES.ADMIN, description: 'Administrador de la plataforma.' },
  });

  // Membership
  await MembershipLevel.findOrCreate({
    where: { name: MEMBERSHIP_LEVELS.BASIC },
    defaults: {
      name: MEMBERSHIP_LEVELS.BASIC,
      description: 'Nivel inicial de membresía digital.',
      discountPercentage: 0,
    },
  });
  await MembershipLevel.findOrCreate({
    where: { name: MEMBERSHIP_LEVELS.STANDARD },
    defaults: {
      name: MEMBERSHIP_LEVELS.STANDARD,
      description: 'Nivel intermedio de membresía digital.',
      discountPercentage: 5,
    },
  });
  await MembershipLevel.findOrCreate({
    where: { name: MEMBERSHIP_LEVELS.PREMIUM },
    defaults: {
      name: MEMBERSHIP_LEVELS.PREMIUM,
      description: 'Nivel superior de membresía digital.',
      discountPercentage: 10,
    },
  });
  await MembershipStatus.findOrCreate({
    where: { name: MEMBERSHIP_STATUSES.ACTIVE },
    defaults: {
      name: MEMBERSHIP_STATUSES.ACTIVE,
      description: 'Membresía activa y habilitada para beneficios.',
    },
  });
  await MembershipStatus.findOrCreate({
    where: { name: MEMBERSHIP_STATUSES.INACTIVE },
    defaults: { name: MEMBERSHIP_STATUSES.INACTIVE, description: 'Membresía inactiva.' },
  });

  console.log('Seed ejecutado: roles, niveles y estados de membresía verificados.');
};
