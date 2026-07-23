import { Router } from 'express';
import { register, login, refresh, logout, getMe, updateProfile } from '../controllers/authController';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateProfile);

export default router;
