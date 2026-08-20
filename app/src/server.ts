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

import userRoutes from './routes/user.routes';
import countryRoutes from './routes/country.routes';
import departmentRoutes from './routes/department.routes';
import cityRoutes from './routes/city.routes';
import authRoutes from './routes/auth.routes';
import movieRoutes from './routes/movie.routes';
import membershipRoutes from './routes/membership.routes';
import notificationRoutes from './routes/notification.routes';
import healthRoutes from './routes/health.routes';
import { rateLimit } from 'express-rate-limit';
import { envConfig } from './config/env';

const app = express();

app.use(helmet());
app.use(express.json());

app.use(
  rateLimit({
    windowMs: envConfig.RATE_LIMIT.WINDOW_MS,
    max: envConfig.RATE_LIMIT.MAX_REQUESTS,
  }),
);

// Configuración de CORS
app.use(cors(corsOptions));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/health', healthRoutes);
// app.use("/api/login", authRoutes);

// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
