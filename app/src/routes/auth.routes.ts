import { Router } from 'express';
import { LoginAuth } from '../controllers/auth.controller';

const router = Router();

router.post('/login', LoginAuth);

// TODO
// router.post('/refresh', refreshToken);
// router.post('/logout', logoutUser);
// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password', resetPassword);

export default router;