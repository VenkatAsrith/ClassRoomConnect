import { Schema, model, Document } from 'mongoose';

export interface IActivityLog extends Document {
  workspaceId: Schema.Types.ObjectId;
  actorId: Schema.Types.ObjectId;
  action: string; // e.g. "created_assignment", "joined_workspace"
  targetType?: string; // e.g. "Assignment", "Workspace"
  targetId?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    targetType: { type: String },
    targetId: { type: Schema.Types.ObjectId }
  },
  { timestamps: true }
);

export const ActivityLog = model<IActivityLog>('ActivityLog', ActivityLogSchema);
