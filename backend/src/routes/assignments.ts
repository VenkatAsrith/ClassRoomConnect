import { Router } from 'express';
import {
  listAssignments,
  createAssignment,
  getAssignmentDetail,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  listSubmissions,
  gradeSubmission
} from '../controllers/assignmentController';
import { requireAuth, requireRole, requireWorkspaceMember, requireWorkspaceRole } from '../middlewares/auth';

const router = Router();

router.get('/workspace/:workspaceId', requireAuth, requireWorkspaceMember, listAssignments);
router.post('/workspace/:workspaceId', requireAuth, requireWorkspaceMember, requireWorkspaceRole('teacher'), createAssignment);

router.get('/:id', requireAuth, getAssignmentDetail);
router.patch('/:id', requireAuth, updateAssignment);
router.delete('/:id', requireAuth, deleteAssignment);

// Submissions
router.post('/:id/submissions', requireAuth, requireRole('student'), submitAssignment);
router.get('/:id/submissions', requireAuth, listSubmissions);
router.patch('/submissions/:id', requireAuth, gradeSubmission);

export default router;
