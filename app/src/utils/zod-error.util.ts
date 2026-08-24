// app/src/utils/zod-error.util.ts

import { ZodError } from 'zod';

export interface ZodErrorDetail {
  path: string;
  message: string;
}

export interface FormattedZodError {
  error: string;
  details: ZodErrorDetail[];
}

export const formatZodError = (error: ZodError): FormattedZodError => {
  const details: ZodErrorDetail[] = error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

  return {
    error: details[0]?.message ?? 'Datos de entrada inválidos.',
    details,
  };
};
