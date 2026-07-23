import { Router } from 'express';
import { listActivityLogs } from '../controllers/activityController';
import { requireAuth, requireWorkspaceMember } from '../middlewares/auth';

const router = Router();

router.get('/workspace/:workspaceId', requireAuth, requireWorkspaceMember, listActivityLogs);

export default router;
