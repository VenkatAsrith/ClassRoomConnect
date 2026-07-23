import { Router } from 'express';
import {
  listChannels,
  createChannel,
  updateChannel,
  getChannelMessages,
  sendMessage
} from '../controllers/channelController';
import { requireAuth, requireWorkspaceMember, requireWorkspaceRole } from '../middlewares/auth';

const router = Router();

// Routes scoped by workspaceId
router.get('/workspace/:workspaceId', requireAuth, requireWorkspaceMember, listChannels);
router.post('/workspace/:workspaceId', requireAuth, requireWorkspaceMember, requireWorkspaceRole('teacher'), createChannel);

// Individual channel operations
router.patch('/:id', requireAuth, updateChannel); // Role check handled dynamically or simpler settings
router.get('/:id/messages', requireAuth, getChannelMessages);
router.post('/:id/messages', requireAuth, sendMessage);

export default router;
