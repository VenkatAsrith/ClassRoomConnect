import { Response } from 'express';
import { ScheduleEntry } from '../models/ScheduleEntry';
import { AuthenticatedRequest } from '../middlewares/auth';
import { ActivityLog } from '../models/ActivityLog';

export const getSchedule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.params.workspaceId;
    const schedule = await ScheduleEntry.find({ workspaceId }).sort({ day: 1, startTime: 1 });
    return res.status(200).json({ schedule });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error fetching schedule.', error: err.message });
  }
};

export const addScheduleEntry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.params.workspaceId;
    const { day, subject, faculty, startTime, endTime, room, notes } = req.body;

    if (!day || !subject || !faculty || !startTime || !endTime) {
      return res.status(400).json({ message: 'Day, subject, faculty, start time, and end time are required.' });
    }

    const entry = new ScheduleEntry({
      workspaceId,
      day,
      subject,
      faculty,
      startTime,
      endTime,
      room,
      notes
    });

    await entry.save();

    // Log Activity
    const activity = new ActivityLog({
      workspaceId,
      actorId: req.user?._id,
      action: 'added_schedule_entry',
      targetType: 'ScheduleEntry',
      targetId: entry._id
    });
    await activity.save();

    return res.status(201).json({ entry });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error adding schedule entry.', error: err.message });
  }
};

export const editScheduleEntry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { day, subject, faculty, startTime, endTime, room, notes } = req.body;
    const entry = await ScheduleEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Schedule entry not found.' });
    }

    if (day) entry.day = day;
    if (subject) entry.subject = subject;
    if (faculty) entry.faculty = faculty;
    if (startTime) entry.startTime = startTime;
    if (endTime) entry.endTime = endTime;
    if (room !== undefined) entry.room = room;
    if (notes !== undefined) entry.notes = notes;

    await entry.save();
    return res.status(200).json({ entry });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error updating schedule entry.', error: err.message });
  }
};

export const removeScheduleEntry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const entry = await ScheduleEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Schedule entry not found.' });
    }

    await ScheduleEntry.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Schedule entry removed successfully.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error removing schedule entry.', error: err.message });
  }
};
