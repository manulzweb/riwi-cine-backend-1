import { Role, MembershipLevel, MembershipStatus } from '../models';

export const runSeed = async (): Promise<void> => {
  // 1. Roles
  await Role.findOrCreate({
    where: { name: 'cliente' },
    defaults: { name: 'cliente', description: 'Usuario final del portal Multicine.' },
  });
  await Role.findOrCreate({
    where: { name: 'admin' },
    defaults: { name: 'admin', description: 'Administrador de la plataforma.' },
  });

  // Membership
  await MembershipLevel.findOrCreate({
    where: { name: 'BÁSICA' },
    defaults: { name: 'BÁSICA', description: 'Nivel inicial de membresía digital.' },
  });
  await MembershipStatus.findOrCreate({
    where: { name: 'Activa' },
    defaults: { name: 'Activa', description: 'Membresía activa y habilitada para beneficios.' },
  });
  await MembershipStatus.findOrCreate({
    where: { name: 'Inactiva' },
    defaults: { name: 'Inactiva', description: 'Membresía inactiva.' },
  });

  console.log('Seed ejecutado: roles, niveles y estados de membresía verificados.');
};
