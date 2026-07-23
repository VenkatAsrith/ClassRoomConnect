import { Schema, model, Document } from 'mongoose';

export interface IScheduleEntry extends Document {
  workspaceId: Schema.Types.ObjectId;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  subject: string;
  faculty: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:00"
  room?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleEntrySchema = new Schema<IScheduleEntry>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], required: true },
    subject: { type: String, required: true },
    faculty: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
);

export const ScheduleEntry = model<IScheduleEntry>('ScheduleEntry', ScheduleEntrySchema);
