import { Router } from 'express';
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcementController';
import { requireAuth, requireWorkspaceMember, requireWorkspaceRole } from '../middlewares/auth';

const router = Router();

router.get('/workspace/:workspaceId', requireAuth, requireWorkspaceMember, listAnnouncements);
router.post('/workspace/:workspaceId', requireAuth, requireWorkspaceMember, requireWorkspaceRole('teacher'), createAnnouncement);
router.patch('/:id', requireAuth, updateAnnouncement);
router.delete('/:id', requireAuth, deleteAnnouncement);

export default router;
