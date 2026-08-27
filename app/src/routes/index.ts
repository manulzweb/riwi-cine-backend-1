// app/src/routes/index.ts

import { Router } from 'express';
import userRoutes from './user.routes.js';
import countryRoutes from './country.routes.js';
import departmentRoutes from './department.routes.js';
import cityRoutes from './city.routes.js';
import authRoutes from './auth.routes.js';
import movieRoutes from './movie.routes.js';
import membershipRoutes from './membership.routes.js';
import notificationRoutes from './notification.routes.js';
import healthRoutes from './health.routes.js';
import reservationRoutes from './reservation.routes.js';
import cartRoutes from './cart.routes.js';
const router = Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/countries', countryRoutes);
router.use('/departments', departmentRoutes);
router.use('/cities', cityRoutes);
router.use('/membership', membershipRoutes);
router.use('/movies', movieRoutes);
router.use('/notifications', notificationRoutes);
router.use('/health', healthRoutes);
router.use(cartRoutes);
router.use(reservationRoutes);

export default router as Router;
