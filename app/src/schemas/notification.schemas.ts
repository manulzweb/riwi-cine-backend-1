// app/src/schemas/notification.schemas.ts

import { z } from 'zod';

export const NotificationUpcomingSchema = z
  .object({
    movieId: z.number().int().positive(),
    userId: z.number().int().positive().optional(),
    email: z.email().optional(),
  })
  .refine((data) => data.userId !== undefined || data.email !== undefined, {
    message: 'Debe proporcionar userId o email.',
    path: ['userId'],
  });

export type NotificationUpcomingDto = z.infer<typeof NotificationUpcomingSchema>;
