import { Response } from 'express';
import { Resource } from '../models/Resource';
import { WorkspaceMember } from '../models/WorkspaceMember';
import { Notification } from '../models/Notification';
import { ActivityLog } from '../models/ActivityLog';
import { AuthenticatedRequest } from '../middlewares/auth';

export const listResources = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.params.workspaceId;
    const resources = await Resource.find({ workspaceId })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ resources });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error listing resources.', error: err.message });
  }
};

export const createResource = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.params.workspaceId;
    const { title, type, url, folder } = req.body;

    if (!title || !type || !url || !folder) {
      return res.status(400).json({ message: 'Title, type, url, and folder are required.' });
    }

    const resource = new Resource({
      workspaceId,
      title,
      type,
      url,
      folder,
      uploadedBy: req.user?._id
    });

    await resource.save();

    const populated = await Resource.findById(resource._id).populate('uploadedBy', 'name');

    // Notify all members
    const members = await WorkspaceMember.find({ workspaceId, status: 'active' });
    const notifications = members
      .filter(m => m.userId.toString() !== req.user?._id.toString())
      .map(m => new Notification({
        userId: m.userId,
        workspaceId,
        type: 'resource',
        message: `New resource uploaded: "${title}" in folder "${folder}"`,
        referenceId: resource._id,
        isRead: false
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Log Activity
    const activity = new ActivityLog({
      workspaceId,
      actorId: req.user?._id,
      action: 'uploaded_resource',
      targetType: 'Resource',
      targetId: resource._id
    });
    await activity.save();

    // Socket Broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(`workspace:${workspaceId}`).emit('resource:new', populated);
      notifications.forEach(n => {
        io.to(`user:${n.userId.toString()}`).emit('notification:new', n);
      });
    }

    return res.status(201).json({ resource: populated });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error uploading resource.', error: err.message });
  }
};

export const deleteResource = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Resource deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error deleting resource.', error: err.message });
  }
};
