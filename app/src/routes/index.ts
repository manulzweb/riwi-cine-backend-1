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
import seedRoutes from './seed.routes.js';
import profileRoutes from './profile.routes.js';
import functionRoutes from './function.routes.js';
import snackRoutes from './snack.routes.js';
const router = Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/countries', countryRoutes);
router.use('/departments', departmentRoutes);
router.use('/cities', cityRoutes);
router.use('/membership', membershipRoutes);
router.use('/movies', movieRoutes);
router.use('/functions', functionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/health', healthRoutes);
router.use('/seed', seedRoutes);
router.use('/reservations', reservationRoutes);
router.use('/cart', cartRoutes);
router.use('/carts', cartRoutes);
router.use('/snacks', snackRoutes);

export default router as Router;
