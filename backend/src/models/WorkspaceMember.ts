import { Schema, model, Document } from 'mongoose';

export interface IWorkspaceMember extends Document {
  workspaceId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  role: 'teacher' | 'student';
  status: 'active' | 'removed';
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['teacher', 'student'], required: true },
    status: { type: String, enum: ['active', 'removed'], default: 'active', required: true },
    joinedAt: { type: Date, default: Date.now, required: true }
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of user per workspace
WorkspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export const WorkspaceMember = model<IWorkspaceMember>('WorkspaceMember', WorkspaceMemberSchema);
