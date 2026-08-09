import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { register, verifyEmail } from '../controllers/auth.controller';

const router = Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de registro, intenta más tarde' },
});

router.post('/register', registerLimiter, register);
router.post('/verify-email', verifyEmail);

export default router;