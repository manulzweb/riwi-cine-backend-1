// app/src/routes/index.ts

import { Router } from 'express';
import userRoutes from './user.routes';
import countryRoutes from './country.routes';
import departmentRoutes from './department.routes';
import cityRoutes from './city.routes';
import authRoutes from './auth.routes';
import movieRoutes from './movie.routes';
import membershipRoutes from './membership.routes';
import notificationRoutes from './notification.routes';
import healthRoutes from './health.routes';
import reservationRoutes from './reservation.routes';
import cartRoutes from './cart.routes';
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
