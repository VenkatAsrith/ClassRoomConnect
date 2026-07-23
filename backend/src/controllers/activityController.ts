import { Response } from 'express';
import { ActivityLog } from '../models/ActivityLog';
import { AuthenticatedRequest } from '../middlewares/auth';

export const listActivityLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.params.workspaceId;
    const logs = await ActivityLog.find({ workspaceId })
      .populate('actorId', 'name avatarUrl role')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({ logs });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error fetching activity logs.', error: err.message });
  }
};
