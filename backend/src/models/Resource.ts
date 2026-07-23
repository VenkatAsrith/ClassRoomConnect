import { Schema, model, Document } from 'mongoose';

export interface IResource extends Document {
  workspaceId: Schema.Types.ObjectId;
  title: string;
  type: 'pdf' | 'ppt' | 'image' | 'video' | 'link';
  url: string;
  folder: string; // e.g. "Syllabus", "Lecture Notes"
  uploadedBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['pdf', 'ppt', 'image', 'video', 'link'], required: true },
    url: { type: String, required: true },
    folder: { type: String, required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const Resource = model<IResource>('Resource', ResourceSchema);
