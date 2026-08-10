// app/src/docs/swagger.ts

/**
 * Swagger Configuration
 * ---------------------
 * Este archivo configura la documentación automática de la API
 * utilizando `swagger-jsdoc` y `swagger-ui-express`.
 *
 * - Genera un esquema OpenAPI (3.0.0).
 * - Extrae la documentación de las anotaciones JSDoc ubicadas en `src/routes/*.ts`.
 *
 * Acceso a la documentación:
 *  - La especificación generada es consumida por `swagger-ui-express`.
 *  - Disponible en `/api/docs` (ver `server.ts`).
 */

import swaggerJSDoc from 'swagger-jsdoc';

/**
 * Opciones de configuración para swagger-jsdoc.
 *
 * `definition`:
 *  - Define la versión de OpenAPI.
 *  - Contiene información básica de la API (título, versión, descripción).
 *
 * `apis`:
 *  - Indica la ruta donde se ubican los archivos con anotaciones JSDoc
 *    que describen los endpoints (en este caso, los archivos de rutas).
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Example',
      version: '1.0.0',
      description: 'Documentación generada automáticamente con Swagger para la API de ejemplo.',
    },
  },
  apis: ['./src/routes/*.ts'], // Escanea las rutas para extraer anotaciones Swagger
};

/**
 * Esquema de especificación Swagger/OpenAPI generado dinámicamente.
 * Este objeto es exportado y utilizado por `swagger-ui-express`.
 */
export const swaggerSpec = swaggerJSDoc(options);