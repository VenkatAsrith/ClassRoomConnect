import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { WorkspaceMember } from '../models/WorkspaceMember';

const JWT_SECRET = process.env.JWT_SECRET || 'classroomconnectsecretkey12345!';

interface SocketWithUser extends Socket {
  userId?: string;
}

export const setupSocket = (io: Server) => {
  io.use(async (socket: SocketWithUser, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token || typeof token !== 'string') {
        return next(new Error('Authentication error. Token required.'));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return next(new Error('Authentication error. Invalid user.'));
      }

      socket.userId = user._id.toString();
      next();
    } catch (err) {
      next(new Error('Authentication error. Invalid token.'));
    }
  });

  const onlineUsers = new Map<string, Set<string>>();

  io.on('connection', async (socket: SocketWithUser) => {
    const userId = socket.userId!;
    socket.join(`user:${userId}`);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    const memberships = await WorkspaceMember.find({ userId, status: 'active' });
    memberships.forEach(m => {
      const workspaceRoom = `workspace:${m.workspaceId.toString()}`;
      socket.join(workspaceRoom);
      socket.to(workspaceRoom).emit('member:online', { userId });
    });

    socket.on('workspace:join', ({ workspaceId }) => {
      if (workspaceId) {
        socket.join(`workspace:${workspaceId}`);
      }
    });

    socket.on('channel:typing', ({ workspaceId, channelId, name, isTyping }) => {
      if (workspaceId) {
        socket.to(`workspace:${workspaceId}`).emit('channel:typing', {
          channelId,
          userId,
          name,
          isTyping
        });
      }
    });

    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          memberships.forEach(m => {
            io.to(`workspace:${m.workspaceId.toString()}`).emit('member:offline', { userId });
          });
        }
      }
    });
  });
};
