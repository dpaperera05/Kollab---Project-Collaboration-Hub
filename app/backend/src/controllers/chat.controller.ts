import { Request, Response } from "express";
import { Chat } from "../models/chat.model";

export const listChats = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const chats = await Chat.find({ participantIds: userId }).sort({ updatedAt: -1 });
  return res.json({ success: true, data: { chats } });
};

export const sendMessage = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { text } = req.body || {};
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!text || !String(text).trim()) return res.status(400).json({ success: false, message: "Message text required" });
  const chat = await Chat.findById(id);
  if (!chat || !chat.participantIds.includes(userId)) {
    return res.status(404).json({ success: false, message: "Chat not found" });
  }
  chat.messages.push({ id: `m-${Date.now()}`, senderId: userId, text: String(text).trim(), timestamp: new Date().toISOString() });
  await chat.save();
  return res.json({ success: true, data: { chat } });
};

export const createChat = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { participantId, participantName } = req.body || {};
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!participantId) return res.status(400).json({ success: false, message: "participantId is required" });
  if (participantId === userId) return res.status(400).json({ success: false, message: "Cannot create chat with yourself" });
  const participants = [userId, participantId].sort();
  const conversationKey = participants.join(":");

  // Atomic upsert to avoid duplicate docs when multiple requests fire
  const chat = await Chat.findOneAndUpdate(
    { conversationKey },
    {
      $setOnInsert: {
        participantIds: participants,
        participantNames: participantName ? { [participantId]: participantName } : undefined,
        conversationKey,
        messages: [],
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  return res.status(201).json({ success: true, data: { chat } });
};
