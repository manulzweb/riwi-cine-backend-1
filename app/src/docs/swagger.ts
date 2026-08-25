// app/src/docs/swagger.ts

/**
 * Configuración de Swagger
 * ------------------------
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
      title: 'Riwi Cine API',
      version: '1.0.0',
      description: 'Documentación generada automáticamente con Swagger para la API de Riwi Cine.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        CartDetailResponseDto: {
          type: 'object',
          properties: {
            cartId: { type: 'integer', example: 1 },
            status: { type: 'string', example: 'ACTIVE', enum: ['ACTIVE', 'EXPIRED', 'CONVERTED'] },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: '2026-08-21T15:00:00.000Z',
            },
            tickets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ticketId: { type: 'integer', example: 1 },
                  reservationId: { type: 'integer', example: 5 },
                  movieTitle: { type: 'string', nullable: true, example: 'Duna: Parte 3' },
                  functionDate: {
                    type: 'string',
                    format: 'date',
                    nullable: true,
                    example: '2026-08-24',
                  },
                  functionTime: { type: 'string', nullable: true, example: '14:46' },
                  roomName: { type: 'string', nullable: true, example: 'Sala 1' },
                  format: { type: 'string', nullable: true, example: '2D' },
                  quantity: { type: 'integer', example: 2 },
                  seatNumbers: { type: 'array', items: { type: 'string' }, example: ['A1', 'A2'] },
                  unitPrice: { type: 'number', example: 12000 },
                  discountAmount: { type: 'number', example: 0 },
                  total: { type: 'number', example: 24000 },
                },
              },
            },
            snacks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  itemId: { type: 'integer', example: 1 },
                  snackId: { type: 'integer', example: 12 },
                  name: { type: 'string', example: 'Crispetas Saladas' },
                  imageUrl: { type: 'string', nullable: true, example: 'http://x' },
                  quantity: { type: 'integer', example: 2 },
                  basePrice: { type: 'number', example: 9000 },
                  unitPrice: { type: 'number', example: 9000 },
                  promotions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        promotionId: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Promo25' },
                        discountType: {
                          type: 'string',
                          enum: ['percent', 'fixed'],
                          example: 'percent',
                        },
                        discountValue: { type: 'number', example: 25 },
                      },
                    },
                  },
                },
              },
            },
            summary: {
              type: 'object',
              properties: {
                subtotal: { type: 'number', example: 24000 },
                membershipDiscountPercentage: { type: 'number', example: 10 },
                membershipDiscount: { type: 'number', example: 2400 },
                promotionsDiscount: { type: 'number', example: 3000 },
                giftcardApplied: { type: 'number', example: 0 },
                taxes: { type: 'number', example: 4104 },
                taxRate: { type: 'number', example: 0.19 },
                total: { type: 'number', example: 25704 },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'No existe un carrito activo para este usuario.' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Escanea las rutas para extraer anotaciones Swagger
};

/**
 * Esquema de especificación Swagger/OpenAPI generado dinámicamente.
 * Este objeto es exportado y utilizado por `swagger-ui-express`.
 */
export const swaggerSpec = swaggerJSDoc(options);
