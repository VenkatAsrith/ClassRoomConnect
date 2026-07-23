import { Router } from 'express';
import { listResources, createResource, deleteResource } from '../controllers/resourceController';
import { requireAuth, requireWorkspaceMember, requireWorkspaceRole } from '../middlewares/auth';

const router = Router();

router.get('/workspace/:workspaceId', requireAuth, requireWorkspaceMember, listResources);
router.post('/workspace/:workspaceId', requireAuth, requireWorkspaceMember, requireWorkspaceRole('teacher'), createResource);
router.delete('/:id', requireAuth, deleteResource);

export default router;
