import { Router } from 'express';
import { listNotifications, markAsRead } from '../controllers/notificationController';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.get('/', requireAuth, listNotifications);
router.patch('/:id/read', requireAuth, markAsRead);

export default router;
