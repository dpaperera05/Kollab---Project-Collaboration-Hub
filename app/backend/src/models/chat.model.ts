import { Schema, model, Document } from "mongoose";

export interface IChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface IChat extends Document {
  participantIds: string[]; // always includes current user
  participantNames?: Record<string, string>;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IChatMessage>(
  {
    id: { type: String, required: true },
    senderId: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    timestamp: { type: String, required: true },
  },
  { _id: false }
);

const chatSchema = new Schema<IChat>(
  {
    participantIds: [{ type: String, ref: "User", index: true }],
    participantNames: { type: Map, of: String },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export const Chat = model<IChat>("Chat", chatSchema);
