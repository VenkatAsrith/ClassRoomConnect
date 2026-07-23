import { Router } from 'express';
import { getSchedule, addScheduleEntry, editScheduleEntry, removeScheduleEntry } from '../controllers/scheduleController';
import { requireAuth, requireWorkspaceMember, requireWorkspaceRole } from '../middlewares/auth';

const router = Router();

router.get('/workspace/:workspaceId', requireAuth, requireWorkspaceMember, getSchedule);
router.post('/workspace/:workspaceId', requireAuth, requireWorkspaceMember, requireWorkspaceRole('teacher'), addScheduleEntry);
router.patch('/:id', requireAuth, editScheduleEntry);
router.delete('/:id', requireAuth, removeScheduleEntry);

export default router;
