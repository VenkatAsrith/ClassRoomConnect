import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  role: 'teacher' | 'student';
  activeWorkspaceId?: Schema.Types.ObjectId;
  refreshTokens?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String },
    role: { type: String, enum: ['teacher', 'student'], required: true },
    activeWorkspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
    refreshTokens: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, required: true }
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
