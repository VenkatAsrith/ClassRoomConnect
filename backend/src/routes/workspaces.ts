import { Router } from 'express';
import {
  createWorkspace,
  joinWorkspace,
  getWorkspaceDetails,
  getDashboardSummary,
  updateWorkspaceSettings,
  deleteWorkspace,
  listWorkspaceMembers,
  removeWorkspaceMember
} from '../controllers/workspaceController';
import { requireAuth, requireRole, requireWorkspaceMember, requireWorkspaceRole } from '../middlewares/auth';

const router = Router();

// Create workspace is teacher only
router.post('/', requireAuth, requireRole('teacher'), createWorkspace);
// Join is student only
router.post('/join', requireAuth, requireRole('student'), joinWorkspace);

// Workspace specific routes (require member checking)
router.get('/:id', requireAuth, requireWorkspaceMember, getWorkspaceDetails);
router.get('/:id/dashboard', requireAuth, requireWorkspaceMember, getDashboardSummary);
router.patch('/:id', requireAuth, requireWorkspaceMember, requireWorkspaceRole('teacher'), updateWorkspaceSettings);
router.delete('/:id', requireAuth, requireWorkspaceMember, requireWorkspaceRole('teacher'), deleteWorkspace);

// Member management
router.get('/:id/members', requireAuth, requireWorkspaceMember, listWorkspaceMembers);
router.delete('/:id/members/:userId', requireAuth, requireWorkspaceMember, requireWorkspaceRole('teacher'), removeWorkspaceMember);

export default router;
