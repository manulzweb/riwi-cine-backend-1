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
import movieRoutes from "./routes/movie.routes";
import membershipRoutes from './routes/membership.routes';
import { rateLimit } from 'express-rate-limit';

const app = express();

app.use(helmet());
app.use(express.json());

app.use(
  rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS
      ? Number(process.env.RATE_LIMIT_WINDOW_MS)
      : 10 * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS ? Number(process.env.RATE_LIMIT_MAX_REQUESTS) : 100,
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
app.use("/api/movies", movieRoutes);
// app.use("/api/login", authRoutes);

// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
