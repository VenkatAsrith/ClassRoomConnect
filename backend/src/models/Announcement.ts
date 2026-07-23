import { Schema, model, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  workspaceId: Schema.Types.ObjectId;
  title: string;
  body: string;
  authorId: Schema.Types.ObjectId;
  attachments?: string[];
  pinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    attachments: { type: [String], default: [] },
    pinned: { type: Boolean, default: false, required: true },
    isArchived: { type: Boolean, default: false, required: true }
  },
  { timestamps: true }
);

export const Announcement = model<IAnnouncement>('Announcement', AnnouncementSchema);
