import { Schema, model, Document } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  subject: string;
  description?: string;
  ownerId: Schema.Types.ObjectId;
  joinCode: string;
  memberCount: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinCode: { type: String, required: true, unique: true, index: true },
    memberCount: { type: Number, default: 1, required: true },
    isArchived: { type: Boolean, default: false, required: true }
  },
  { timestamps: true }
);

export const Workspace = model<IWorkspace>('Workspace', WorkspaceSchema);
