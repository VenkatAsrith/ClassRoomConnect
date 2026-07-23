import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { WorkspaceMember, IWorkspaceMember } from '../models/WorkspaceMember';

const JWT_SECRET = process.env.JWT_SECRET || 'classroomconnectsecretkey12345!';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  workspaceMember?: IWorkspaceMember;
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User account is inactive or not found.' });
    }

    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ message: 'Invalid or expired access token.', error: err.message });
  }
};

export const requireRole = (role: 'teacher' | 'student') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: `Access denied. Role '${role}' required.` });
    }

    next();
  };
};

export const requireWorkspaceMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const workspaceId = req.params.workspaceId || req.params.id || req.body.workspaceId;
    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is required for this operation.' });
    }

    const member = await WorkspaceMember.findOne({
      workspaceId,
      userId: req.user._id,
      status: 'active'
    });

    if (!member) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this workspace.' });
    }

    req.workspaceMember = member;
    next();
  } catch (err: any) {
    return res.status(500).json({ message: 'Internal server error validating workspace membership.', error: err.message });
  }
};

export const requireWorkspaceRole = (role: 'teacher' | 'student') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
      }

      if (!req.workspaceMember) {
        const workspaceId = req.params.workspaceId || req.params.id || req.body.workspaceId;
        if (!workspaceId) {
          return res.status(400).json({ message: 'Workspace ID is required for this operation.' });
        }

        const member = await WorkspaceMember.findOne({
          workspaceId,
          userId: req.user._id,
          status: 'active'
        });

        if (!member) {
          return res.status(403).json({ message: 'Access denied. You are not a member of this workspace.' });
        }

        req.workspaceMember = member;
      }

      if (req.workspaceMember.role !== role) {
        return res.status(403).json({ message: `Access denied. Role '${role}' required within this workspace.` });
      }

      next();
    } catch (err: any) {
      return res.status(500).json({ message: 'Error checking workspace permissions.', error: err.message });
    }
  };
};
