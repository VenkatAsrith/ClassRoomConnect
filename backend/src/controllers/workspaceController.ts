import { Response } from 'express';
import { Workspace } from '../models/Workspace';
import { WorkspaceMember } from '../models/WorkspaceMember';
import { User } from '../models/User';
import { Announcement } from '../models/Announcement';
import { Assignment } from '../models/Assignment';
import { Resource } from '../models/Resource';
import { ActivityLog } from '../models/ActivityLog';
import { AuthenticatedRequest } from '../middlewares/auth';

// Helper to generate CLS-XXXXXX join code
const generateJoinCode = async (): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let code = '';
  
  while (!isUnique) {
    let raw = '';
    for (let i = 0; i < 6; i++) {
      raw += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code = `CLS-${raw}`;
    const existing = await Workspace.findOne({ joinCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

export const createWorkspace = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { name, subject, description } = req.body;
    if (!name || !subject) {
      return res.status(400).json({ message: 'Name and subject are required.' });
    }

    const joinCode = await generateJoinCode();
    const workspace = new Workspace({
      name,
      subject,
      description,
      ownerId: req.user._id,
      joinCode,
      memberCount: 1
    });

    await workspace.save();

    // Create owner membership
    const member = new WorkspaceMember({
      workspaceId: workspace._id,
      userId: req.user._id,
      role: 'teacher',
      status: 'active'
    });
    await member.save();

    // Update teacher's activeWorkspaceId
    await User.findByIdAndUpdate(req.user._id, { activeWorkspaceId: workspace._id });

    // Log Activity
    const activity = new ActivityLog({
      workspaceId: workspace._id,
      actorId: req.user._id,
      action: 'created_workspace',
      targetType: 'Workspace',
      targetId: workspace._id
    });
    await activity.save();

    return res.status(201).json({ workspace, member });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error creating workspace.', error: err.message });
  }
};

export const joinWorkspace = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Join code is required.' });
    }

    const workspace = await Workspace.findOne({ joinCode: code.toUpperCase(), isArchived: false });
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found. Check join code.' });
    }

    // Enforce student single-workspace rule
    if (req.user.role === 'student') {
      const user = await User.findById(req.user._id);
      if (user && user.activeWorkspaceId) {
        return res.status(400).json({
          message: 'Students can only join one workspace at a time. Leave your current workspace before joining a new one.'
        });
      }
    }

    // Check if user is already a member
    const existingMember = await WorkspaceMember.findOne({
      workspaceId: workspace._id,
      userId: req.user._id
    });

    if (existingMember) {
      if (existingMember.status === 'active') {
        return res.status(400).json({ message: 'You are already a member of this workspace.' });
      } else {
        // Re-activate member
        existingMember.status = 'active';
        existingMember.joinedAt = new Date();
        await existingMember.save();
      }
    } else {
      // Create new member
      const newMember = new WorkspaceMember({
        workspaceId: workspace._id,
        userId: req.user._id,
        role: req.user.role,
        status: 'active'
      });
      await newMember.save();
    }

    // Increment member count
    workspace.memberCount = await WorkspaceMember.countDocuments({ workspaceId: workspace._id, status: 'active' });
    await workspace.save();

    // Update activeWorkspaceId
    await User.findByIdAndUpdate(req.user._id, { activeWorkspaceId: workspace._id });

    // Log Activity
    const activity = new ActivityLog({
      workspaceId: workspace._id,
      actorId: req.user._id,
      action: 'joined_workspace',
      targetType: 'Workspace',
      targetId: workspace._id
    });
    await activity.save();

    return res.status(200).json({
      message: 'Successfully joined workspace.',
      workspace
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error joining workspace.', error: err.message });
  }
};

export const getWorkspaceDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace || workspace.isArchived) {
      return res.status(404).json({ message: 'Workspace not found.' });
    }
    return res.status(200).json({ workspace });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error fetching workspace.', error: err.message });
  }
};

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.params.id;

    // Fetch dashboard items in parallel
    const [announcements, assignments, resources, membersCount] = await Promise.all([
      Announcement.find({ workspaceId, isArchived: false })
        .sort({ pinned: -1, createdAt: -1 })
        .limit(5)
        .populate('authorId', 'name avatarUrl'),
      Assignment.find({ workspaceId })
        .sort({ dueDate: 1 })
        .limit(5)
        .populate('createdBy', 'name'),
      Resource.find({ workspaceId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('uploadedBy', 'name'),
      WorkspaceMember.countDocuments({ workspaceId, status: 'active' })
    ]);

    const stats = {
      members: membersCount,
      assignments: await Assignment.countDocuments({ workspaceId }),
      resources: await Resource.countDocuments({ workspaceId }),
      announcements: await Announcement.countDocuments({ workspaceId, isArchived: false })
    };

    return res.status(200).json({
      announcements,
      assignments,
      resources,
      stats
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error loading dashboard summary.', error: err.message });
  }
};

export const updateWorkspaceSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, subject, description } = req.body;
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found.' });
    }

    if (name) workspace.name = name;
    if (subject) workspace.subject = subject;
    if (description !== undefined) workspace.description = description;

    await workspace.save();
    return res.status(200).json({ workspace });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error updating workspace settings.', error: err.message });
  }
};

export const deleteWorkspace = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found.' });
    }

    if (workspace.ownerId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Only the workspace owner can delete this workspace.' });
    }

    workspace.isArchived = true;
    await workspace.save();

    // Clear activeWorkspaceId from all users who had this workspace active
    await User.updateMany({ activeWorkspaceId: workspace._id }, { $unset: { activeWorkspaceId: '' } });

    return res.status(200).json({ message: 'Workspace soft deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error deleting workspace.', error: err.message });
  }
};

export const listWorkspaceMembers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const members = await WorkspaceMember.find({ workspaceId: req.params.id, status: 'active' })
      .populate('userId', 'name email avatarUrl role isActive')
      .sort({ role: 1, joinedAt: 1 });

    return res.status(200).json({ members });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error listing workspace members.', error: err.message });
  }
};

export const removeWorkspaceMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: workspaceId, userId } = req.params;

    const member = await WorkspaceMember.findOne({ workspaceId, userId, status: 'active' });
    if (!member) {
      return res.status(404).json({ message: 'Member not found or already removed.' });
    }

    if (member.role === 'teacher') {
      const teachersCount = await WorkspaceMember.countDocuments({ workspaceId, role: 'teacher', status: 'active' });
      if (teachersCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the last teacher from the workspace.' });
      }
    }

    member.status = 'removed';
    await member.save();

    // Decrement member count
    const workspace = await Workspace.findById(workspaceId);
    if (workspace) {
      workspace.memberCount = await WorkspaceMember.countDocuments({ workspaceId, status: 'active' });
      await workspace.save();
    }

    // Clear activeWorkspaceId for this removed user
    await User.findByIdAndUpdate(userId, { $unset: { activeWorkspaceId: '' } });

    // Log Activity
    const activity = new ActivityLog({
      workspaceId,
      actorId: req.user?._id,
      action: 'removed_member',
      targetType: 'User',
      targetId: userId
    });
    await activity.save();

    return res.status(200).json({ message: 'Member removed successfully.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error removing member.', error: err.message });
  }
};
