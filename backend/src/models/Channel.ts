import { Schema, model, Document } from 'mongoose';

export interface IChannel extends Document {
  workspaceId: Schema.Types.ObjectId;
  name: string;
  type: 'general' | 'assignments' | 'resources' | 'projects' | 'discussion' | 'custom';
  createdBy: Schema.Types.ObjectId;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChannelSchema = new Schema<IChannel>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['general', 'assignments', 'resources', 'projects', 'discussion', 'custom'],
      required: true
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isArchived: { type: Boolean, default: false, required: true }
  },
  { timestamps: true }
);

export const Channel = model<IChannel>('Channel', ChannelSchema);
