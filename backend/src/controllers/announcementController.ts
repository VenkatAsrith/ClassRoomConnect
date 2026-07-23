import { Response } from 'express';
import { Announcement } from '../models/Announcement';
import { WorkspaceMember } from '../models/WorkspaceMember';
import { Notification } from '../models/Notification';
import { ActivityLog } from '../models/ActivityLog';
import { AuthenticatedRequest } from '../middlewares/auth';

export const listAnnouncements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.params.workspaceId;
    const announcements = await Announcement.find({ workspaceId, isArchived: false })
      .populate('authorId', 'name avatarUrl role')
      .sort({ pinned: -1, createdAt: -1 });

    return res.status(200).json({ announcements });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error listing announcements.', error: err.message });
  }
};

export const createAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.params.workspaceId;
    const { title, body, attachments, pinned } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required.' });
    }

    const announcement = new Announcement({
      workspaceId,
      title,
      body,
      authorId: req.user?._id,
      attachments,
      pinned: pinned || false,
      isArchived: false
    });

    await announcement.save();

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('authorId', 'name avatarUrl role');

    // Create notifications for all active members in the workspace (except creator)
    const members = await WorkspaceMember.find({ workspaceId, status: 'active' });
    const notifications = members
      .filter(m => m.userId.toString() !== req.user?._id.toString())
      .map(m => new Notification({
        userId: m.userId,
        workspaceId,
        type: 'announcement',
        message: `New announcement: "${title}" by ${req.user?.name}`,
        referenceId: announcement._id,
        isRead: false
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Log Activity
    const activity = new ActivityLog({
      workspaceId,
      actorId: req.user?._id,
      action: 'published_announcement',
      targetType: 'Announcement',
      targetId: announcement._id
    });
    await activity.save();

    // Socket Broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(`workspace:${workspaceId}`).emit('announcement:new', populatedAnnouncement);
      // For each notified member, send notification socket update
      notifications.forEach(n => {
        io.to(`user:${n.userId.toString()}`).emit('notification:new', n);
      });
    }

    return res.status(201).json({ announcement: populatedAnnouncement });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error publishing announcement.', error: err.message });
  }
};

export const updateAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, body, pinned, isArchived, attachments } = req.body;
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }

    if (title) announcement.title = title;
    if (body) announcement.body = body;
    if (pinned !== undefined) announcement.pinned = pinned;
    if (isArchived !== undefined) announcement.isArchived = isArchived;
    if (attachments) announcement.attachments = attachments;

    await announcement.save();

    const populated = await Announcement.findById(announcement._id)
      .populate('authorId', 'name avatarUrl role');

    return res.status(200).json({ announcement: populated });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error updating announcement.', error: err.message });
  }
};

export const deleteAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Announcement deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error deleting announcement.', error: err.message });
  }
};
