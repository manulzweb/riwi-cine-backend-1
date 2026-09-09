// app/src/jobs/cart-expiry.job.ts

import cron, { ScheduledTask } from 'node-cron';
import { cartService } from '../containers/cart.container.js';

const CRON_SCHEDULE = '* * * * *';

/**
 * Job programado que expira los carritos vencidos (RN-046) y libera
 * las sillas reservadas asociadas (RN-045).
 *
 * Se ejecuta cada minuto para mantener la ventana de diez minutos de
 * inactividad con precisión razonable.
 */
export const startCartExpiryJob = (): ScheduledTask => {
  return cron.schedule(CRON_SCHEDULE, async () => {
    try {
      const result = await cartService.expireCarts();

      if (result.cartsExpired > 0 || result.errors.length > 0) {
        console.log(
          `[CartExpiryJob] Carritos expirados: ${result.cartsExpired} | Errores: ${result.errors.length}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`[CartExpiryJob] Error: ${message}`);
    }
  });
};
