import { Schema, model, Document } from 'mongoose';

export interface IAssignment extends Document {
  workspaceId: Schema.Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  attachments?: string[];
  createdBy: Schema.Types.ObjectId;
  maxScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    attachments: { type: [String], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    maxScore: { type: Number }
  },
  { timestamps: true }
);

export const Assignment = model<IAssignment>('Assignment', AssignmentSchema);
