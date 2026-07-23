import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  userId: Schema.Types.ObjectId;
  workspaceId: Schema.Types.ObjectId;
  type: 'assignment' | 'announcement' | 'join' | 'resource' | 'schedule';
  message: string;
  isRead: boolean;
  referenceId?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    type: {
      type: String,
      enum: ['assignment', 'announcement', 'join', 'resource', 'schedule'],
      required: true
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, required: true },
    referenceId: { type: Schema.Types.ObjectId }
  },
  { timestamps: true }
);

export const Notification = model<INotification>('Notification', NotificationSchema);
