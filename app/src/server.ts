// app/src/server.ts

/**
 * Se encarga únicamente de configurar la aplicación Express: middlewares, rutas, swagger, etc.
 * No arranca el servidor ni toca la base de datos.
 * Esto hace que la aplicación sea testeable fácilmente, porque podemos importar app en nuestros tests sin necesidad de levantar el servidor real ni conectarse a la BD.
 */

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { envConfig } from './config/env.js';
import router from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: envConfig.NODE_ENV === 'production' ? undefined : false,
  }),
);
app.use(express.json());

app.use(
  rateLimit({
    windowMs: envConfig.RATE_LIMIT.WINDOW_MS,
    max: envConfig.RATE_LIMIT.MAX_REQUESTS,
  }),
);

// Configuración de CORS
app.use(cors(corsOptions));

// Router principal

app.use('/api/v1', router);

// Swagger - disponible en /api/docs y /api/v1/docs para no romper con versionado RN-113
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handler centralizado — debe ir al final, después de todas las rutas
app.use(errorHandler);

export default app;
