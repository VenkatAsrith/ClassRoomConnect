import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  channelId: Schema.Types.ObjectId;
  authorId: Schema.Types.ObjectId;
  body: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    body: { type: String, required: true },
    attachments: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const Message = model<IMessage>('Message', MessageSchema);
