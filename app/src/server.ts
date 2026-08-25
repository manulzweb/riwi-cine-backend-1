// app/src/server.ts

/**
 * Se encarga únicamente de configurar la aplicación Express: middlewares, rutas, swagger, etc.
 * No arranca el servidor ni toca la base de datos.
 * Esto hace que la aplicación sea testeable fácilmente, porque podemos importar app en nuestros tests sin necesidad de levantar el servidor real ni conectarse a la BD.
 */

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';
import cors from 'cors';
import { corsOptions } from './config/cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { envConfig } from './config/env';
import router from './routes';

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

// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
