import { Request, Response } from "express";
import { Chat } from "../models/chat.model";
import { User } from "../models/user.model";
import { Project } from "../models/project.model";

export const listChats = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const chats = await Chat.find({ participantIds: userId, "messages.0": { $exists: true } }).sort({ updatedAt: -1 }).lean();

  const participantIds = Array.from(new Set(chats.flatMap((c) => c.participantIds)));
  const users = await User.find({ _id: { $in: participantIds } }, "name").lean();
  const nameMap = new Map<string, string>(users.map((u) => [u._id.toString(), u.name || ""]));

  const projectIds = Array.from(new Set(chats.map((c) => c.projectId).filter(Boolean))) as string[];
  const projects = projectIds.length ? await Project.find({ _id: { $in: projectIds } }, "title").lean() : [];
  const projectMap = new Map<string, string>(projects.map((p) => [p._id.toString(), p.title || "Project"]));

  const enriched = chats.map((c) => ({
    ...c,
    participantNames: c.participantNames || c.participantIds.reduce<Record<string, string>>((acc, id) => {
      acc[id] = nameMap.get(id) || "";
      return acc;
    }, {}),
    projectTitle: c.projectId ? projectMap.get(String(c.projectId)) || "Project" : undefined,
  }));

  return res.json({ success: true, data: { chats: enriched } });
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
  const { participantId, participantName, projectId } = req.body || {};
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!participantId) return res.status(400).json({ success: false, message: "participantId is required" });
  if (participantId === userId) return res.status(400).json({ success: false, message: "Cannot create chat with yourself" });

  const participants = [userId, participantId].sort();
  const normalizedProjectId = projectId ? String(projectId) : undefined;
  const conversationKey = normalizedProjectId ? `${participants.join(":")}:project:${normalizedProjectId}` : participants.join(":");

  // Atomic upsert to avoid duplicate docs when multiple requests fire
  const chat = await Chat.findOneAndUpdate(
    { conversationKey },
    {
      $setOnInsert: {
        participantIds: participants,
        participantNames: participantName ? { [participantId]: participantName } : undefined,
        conversationKey,
        projectId: normalizedProjectId,
        messages: [],
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  return res.status(201).json({ success: true, data: { chat } });
};
