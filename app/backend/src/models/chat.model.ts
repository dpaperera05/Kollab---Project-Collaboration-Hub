import { Schema, model, Document } from "mongoose";

export interface IChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  senderName?: string;
  senderAvatar?: string;
}

export interface IChat extends Document {
  participantIds: string[]; // always includes current user
  participantNames?: Record<string, string>;
  conversationKey: string;
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
    senderName: { type: String, trim: true },
    senderAvatar: { type: String, trim: true },
  },
  { _id: false }
);

const chatSchema = new Schema<IChat>(
  {
    participantIds: [{ type: String, ref: "User", index: true }],
    participantNames: { type: Map, of: String },
    conversationKey: { type: String, required: true, unique: true, index: true },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export const Chat = model<IChat>("Chat", chatSchema);
