import { Response } from 'express';
import { Channel } from '../models/Channel';
import { Message } from '../models/Message';
import { AuthenticatedRequest } from '../middlewares/auth';
import { ActivityLog } from '../models/ActivityLog';

// We will fetch the Socket.IO instance attached to the Express app if needed, or emit from route
export const listChannels = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.params.workspaceId;
    const channels = await Channel.find({ workspaceId, isArchived: false }).sort({ createdAt: 1 });
    return res.status(200).json({ channels });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error listing channels.', error: err.message });
  }
};

export const createChannel = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.params.workspaceId;
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Channel name and type are required.' });
    }

    const channel = new Channel({
      workspaceId,
      name,
      type,
      createdBy: req.user?._id,
      isArchived: false
    });

    await channel.save();

    // Log Activity
    const activity = new ActivityLog({
      workspaceId,
      actorId: req.user?._id,
      action: 'created_channel',
      targetType: 'Channel',
      targetId: channel._id
    });
    await activity.save();

    return res.status(201).json({ channel });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error creating channel.', error: err.message });
  }
};

export const updateChannel = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, isArchived } = req.body;
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found.' });
    }

    if (name) channel.name = name;
    if (isArchived !== undefined) channel.isArchived = isArchived;

    await channel.save();
    return res.status(200).json({ channel });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error updating channel.', error: err.message });
  }
};

export const getChannelMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const channelId = req.params.id;
    // Standard fetch, sorted by ascending createdAt for chat order
    const messages = await Message.find({ channelId })
      .populate('authorId', 'name avatarUrl role')
      .sort({ createdAt: 1 })
      .limit(100); // Pagination limit of 100 messages for historical viewing

    return res.status(200).json({ messages });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error fetching channel messages.', error: err.message });
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const channelId = req.params.id;
    const { body, attachments } = req.body;

    if (!body && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: 'Message content or attachments are required.' });
    }

    const channel = await Channel.findById(channelId);
    if (!channel || channel.isArchived) {
      return res.status(404).json({ message: 'Channel not found or archived.' });
    }

    const message = new Message({
      channelId,
      authorId: req.user?._id,
      body,
      attachments
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('authorId', 'name avatarUrl role');

    // Socket broadcast will be triggered from here using app.get('io') if running,
    // we'll fetch the io instance from Express app settings.
    const io = req.app.get('io');
    if (io) {
      io.to(`workspace:${channel.workspaceId}`).emit('channel:message', populatedMessage);
    }

    return res.status(201).json({ message: populatedMessage });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error sending message.', error: err.message });
  }
};
