import { Response } from 'express';
import { Notification } from '../models/Notification';
import { AuthenticatedRequest } from '../middlewares/auth';

export const listNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ notifications });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error fetching notifications.', error: err.message });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    if (notification.userId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({ notification });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error marking notification as read.', error: err.message });
  }
};
