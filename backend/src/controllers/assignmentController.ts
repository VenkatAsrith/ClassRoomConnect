import { Response } from 'express';
import { Assignment } from '../models/Assignment';
import { Submission } from '../models/Submission';
import { WorkspaceMember } from '../models/WorkspaceMember';
import { Notification } from '../models/Notification';
import { ActivityLog } from '../models/ActivityLog';
import { AuthenticatedRequest } from '../middlewares/auth';

export const listAssignments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.params.workspaceId;
    const assignments = await Assignment.find({ workspaceId })
      .populate('createdBy', 'name')
      .sort({ dueDate: 1 });

    return res.status(200).json({ assignments });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error listing assignments.', error: err.message });
  }
};

export const createAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.params.workspaceId;
    const { title, description, dueDate, attachments, maxScore } = req.body;

    if (!title || !description || !dueDate) {
      return res.status(400).json({ message: 'Title, description, and due date are required.' });
    }

    const assignment = new Assignment({
      workspaceId,
      title,
      description,
      dueDate: new Date(dueDate),
      attachments,
      maxScore,
      createdBy: req.user?._id
    });

    await assignment.save();

    // Create notifications for all students in the workspace
    const students = await WorkspaceMember.find({ workspaceId, role: 'student', status: 'active' });
    const notifications = students.map(s => new Notification({
      userId: s.userId,
      workspaceId,
      type: 'assignment',
      message: `New assignment published: "${title}". Due by ${new Date(dueDate).toLocaleString()}`,
      referenceId: assignment._id,
      isRead: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Log Activity
    const activity = new ActivityLog({
      workspaceId,
      actorId: req.user?._id,
      action: 'created_assignment',
      targetType: 'Assignment',
      targetId: assignment._id
    });
    await activity.save();

    // Socket Broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(`workspace:${workspaceId}`).emit('assignment:new', assignment);
      notifications.forEach(n => {
        io.to(`user:${n.userId.toString()}`).emit('notification:new', n);
      });
    }

    return res.status(201).json({ assignment });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error creating assignment.', error: err.message });
  }
};

export const getAssignmentDetail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('createdBy', 'name');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    // Fetch user's own submission if student
    let submission = null;
    if (req.user?.role === 'student') {
      submission = await Submission.findOne({ assignmentId: assignment._id, studentId: req.user._id });
    }

    return res.status(200).json({ assignment, submission });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error fetching assignment detail.', error: err.message });
  }
};

export const updateAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, dueDate, attachments, maxScore } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (dueDate) assignment.dueDate = new Date(dueDate);
    if (attachments) assignment.attachments = attachments;
    if (maxScore !== undefined) assignment.maxScore = maxScore;

    await assignment.save();
    return res.status(200).json({ assignment });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error updating assignment.', error: err.message });
  }
};

export const deleteAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    // Remove submissions for this assignment as well
    await Submission.deleteMany({ assignmentId: req.params.id });

    return res.status(200).json({ message: 'Assignment deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error deleting assignment.', error: err.message });
  }
};

export const submitAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const assignmentId = req.params.id;
    const { files, comment } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'At least one file URL is required.' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    const isLate = new Date() > new Date(assignment.dueDate);
    const status = isLate ? 'late' : 'submitted';

    // Upsert submission (if user already submitted, overwrite/update, else create)
    let submission = await Submission.findOne({ assignmentId, studentId: req.user._id });
    if (submission) {
      submission.files = files;
      submission.comment = comment;
      submission.submittedAt = new Date();
      submission.status = status;
      await submission.save();
    } else {
      submission = new Submission({
        assignmentId,
        studentId: req.user._id,
        files,
        comment,
        submittedAt: new Date(),
        status
      });
      await submission.save();
    }

    // Log Activity
    const activity = new ActivityLog({
      workspaceId: assignment.workspaceId,
      actorId: req.user._id,
      action: 'submitted_assignment',
      targetType: 'Assignment',
      targetId: assignment._id
    });
    await activity.save();

    return res.status(201).json({ message: 'Assignment submitted successfully.', submission });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error submitting assignment.', error: err.message });
  }
};

export const listSubmissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const submissions = await Submission.find({ assignmentId: req.params.id })
      .populate('studentId', 'name email avatarUrl')
      .sort({ submittedAt: -1 });

    return res.status(200).json({ submissions });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error listing submissions.', error: err.message });
  }
};

export const gradeSubmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { score, feedback } = req.body;
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    if (score !== undefined) submission.score = score;
    if (feedback !== undefined) submission.feedback = feedback;
    submission.status = 'graded';

    await submission.save();

    const assignment = await Assignment.findById(submission.assignmentId);

    // Notify Student
    const notification = new Notification({
      userId: submission.studentId,
      workspaceId: assignment?.workspaceId,
      type: 'assignment',
      message: `Your assignment "${assignment?.title}" has been graded. Score: ${score}/${assignment?.maxScore || '100'}`,
      referenceId: submission.assignmentId,
      isRead: false
    });
    await notification.save();

    // Socket Broadcast to single user room
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${submission.studentId.toString()}`).emit('notification:new', notification);
    }

    return res.status(200).json({ message: 'Submission graded successfully.', submission });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error grading submission.', error: err.message });
  }
};
