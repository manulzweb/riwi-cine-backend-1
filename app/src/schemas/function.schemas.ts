// app/src/schemas/function.schemas.ts

import { z } from 'zod';

/**
 * Query params de GET /movies/{id}/functions (HU-009).
 * Todos son opcionales y acumulativos.
 */
export const FunctionListQuerySchema = z.object({
  format: z.string().trim().min(1).max(20).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD')
    .optional(),
  cinemaId: z.coerce.number().int().positive().optional(),
});

export type FunctionListQueryDto = z.infer<typeof FunctionListQuerySchema>;
