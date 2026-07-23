import { Schema, model, Document } from 'mongoose';

export interface ISubmission extends Document {
  assignmentId: Schema.Types.ObjectId;
  studentId: Schema.Types.ObjectId;
  files: string[];
  comment?: string;
  submittedAt: Date;
  status: 'submitted' | 'late' | 'graded';
  score?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    files: { type: [String], required: true },
    comment: { type: String },
    submittedAt: { type: Date, default: Date.now, required: true },
    status: { type: String, enum: ['submitted', 'late', 'graded'], default: 'submitted', required: true },
    score: { type: Number },
    feedback: { type: String }
  },
  { timestamps: true }
);

// Compound index to ensure a student submits only once per assignment
SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const Submission = model<ISubmission>('Submission', SubmissionSchema);
