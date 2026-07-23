import { Response } from 'express';
import { Channel } from '../models/Channel';
import { Announcement } from '../models/Announcement';
import { Assignment } from '../models/Assignment';
import { Resource } from '../models/Resource';
import { WorkspaceMember } from '../models/WorkspaceMember';
import { AuthenticatedRequest } from '../middlewares/auth';

export const searchWorkspace = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q, workspaceId } = req.query;

    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is required for search.' });
    }

    if (!q || typeof q !== 'string') {
      return res.status(200).json({
        channels: [],
        announcements: [],
        assignments: [],
        resources: [],
        members: []
      });
    }

    const regex = new RegExp(q, 'i');

    const [channels, announcements, assignments, resources, members] = await Promise.all([
      Channel.find({ workspaceId, name: regex, isArchived: false }),
      Announcement.find({ workspaceId, $or: [{ title: regex }, { body: regex }], isArchived: false }),
      Assignment.find({ workspaceId, $or: [{ title: regex }, { description: regex }] }),
      Resource.find({ workspaceId, $or: [{ title: regex }, { folder: regex }] }),
      WorkspaceMember.find({ workspaceId, status: 'active' })
        .populate({
          path: 'userId',
          match: { name: regex },
          select: 'name email avatarUrl role'
        })
    ]);

    // Filter out members where populated user is null (did not match name)
    const matchedMembers = members.filter(m => m.userId !== null);

    return res.status(200).json({
      channels,
      announcements,
      assignments,
      resources,
      members: matchedMembers
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error executing search.', error: err.message });
  }
};
