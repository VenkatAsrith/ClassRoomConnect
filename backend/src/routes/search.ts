import { Router } from 'express';
import { searchWorkspace } from '../controllers/searchController';
import { requireAuth, requireWorkspaceMember } from '../middlewares/auth';

const router = Router();

// Endpoint: /api/search?q=query&workspaceId=id
router.get('/', requireAuth, requireWorkspaceMember, searchWorkspace);

export default router;
