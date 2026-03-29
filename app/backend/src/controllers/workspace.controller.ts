import { Request, Response } from "express";
import { Project } from "../models/project.model";
import { WorkspaceBoard } from "../models/workspace.model";
import { Chat } from "../models/chat.model";
import { User } from "../models/user.model";

const WORKSPACE_CHAT_PREFIX = "project:";
const VALID_STATUSES = ["todo", "in-progress", "done"] as const;

type ValidStatus = (typeof VALID_STATUSES)[number];

const normalizeStatus = (status?: string): ValidStatus | null => {
  if (!status) return null;
  const lower = status.toLowerCase();
  if (lower === "completed" || lower === "complete") return "done";
  if (VALID_STATUSES.includes(lower as ValidStatus)) return lower as ValidStatus;
  return null;
};

const ensureProjectAccess = async (projectId: string, userId: string | undefined, res: Response) => {
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return null;
  }

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404).json({ success: false, message: "Project not found" });
    return null;
  }

    const members = project.members || [];
    const isMember = project.ownerId === userId || members.some((m) => m.userId === userId);
  if (!isMember) {
    res.status(403).json({ success: false, message: "Access denied" });
    return null;
  }

    return { project, members } as const;
};

const ensureBoard = async (projectId: string) => {
  return WorkspaceBoard.findOneAndUpdate(
    { projectId },
    { $setOnInsert: { projectId, tasks: [] } },
    { upsert: true, returnDocument: "after" }
  );
};

const ensureProjectChat = async (projectId: string, participantIds: string[], participantNames?: Map<string, { name?: string; avatar?: string }>) => {
  const conversationKey = `${WORKSPACE_CHAT_PREFIX}${projectId}`;
  const uniqueParticipants = Array.from(new Set(participantIds));
  return Chat.findOneAndUpdate(
    { conversationKey },
    {
      $set: {
        participantIds: uniqueParticipants,
        participantNames: participantNames
          ? Object.fromEntries(Array.from(participantNames.entries()).map(([id, info]) => [id, info.name || "Member"]))
          : undefined,
      },
      $setOnInsert: { conversationKey, messages: [], projectId },
    },
    { upsert: true, returnDocument: "after" }
  );
};

const loadMembers = async (userIds: string[]) => {
  const users = await User.find({ _id: { $in: userIds } }).select("name profile.avatarUrl");
  const userMap = new Map<string, { name?: string; avatar?: string }>();
  users.forEach((u) => {
    const avatar = u.profile?.avatarUrl;
    userMap.set(u.id, { name: u.name || u.profile?.name, avatar });
  });
  return userMap;
};

export const getWorkspace = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;
    const access = await ensureProjectAccess(projectId, userId, res);
    if (!access) return;
    const { project, members: projectMembers } = access;

    const participantIds = [project.ownerId, ...(projectMembers || []).map((m) => m.userId).filter(Boolean)] as string[];
    const memberMap = await loadMembers(participantIds);
    const [board, chat] = await Promise.all([ensureBoard(projectId), ensureProjectChat(projectId, participantIds, memberMap)]);
    const members = participantIds.map((id) => {
      const info = memberMap.get(id) || {};
      const memberRecord = (projectMembers || []).find((m) => m.userId === id);
      return {
        id,
        name: info.name || "Member",
        avatar: info.avatar || "",
        role: id === project.ownerId ? "Project Owner" : memberRecord?.role || "Member",
        isOwner: id === project.ownerId,
      };
    });

    return res.json({
      success: true,
      data: {
        project: {
          id: project.id,
          title: project.title,
          status: project.status,
          domain: project.domain ? [project.domain] : [],
        },
        tasks: board?.tasks || [],
        chatMessages: chat?.messages || [],
        members,
      },
    });
  } catch (error) {
    console.error("getWorkspace failed", error);
    return res.status(500).json({ success: false, message: "Failed to load workspace" });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;
    const { title, description, assignedTo } = req.body || {};
    const status = normalizeStatus(req.body?.status);

    const access = await ensureProjectAccess(projectId, userId, res);
    if (!access) return;
    const { project, members } = access;

    if (!title) {
      return res.status(400).json({ success: false, message: "title is required" });
    }

    const participantIds = [project.ownerId, ...(members || []).map((m) => m.userId).filter(Boolean)] as string[];
    if (assignedTo && !participantIds.includes(assignedTo)) {
      return res.status(400).json({ success: false, message: "Assigned user must be a project member" });
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const board = await ensureBoard(projectId);
    const now = new Date().toISOString();
    const task = {
      id: `task-${Date.now()}`,
      title: String(title).trim(),
      description: description ? String(description).trim() : "",
      assignedTo: assignedTo || null,
      status: status || "todo",
      createdAt: now,
      updatedAt: now,
    } as const;

    board.tasks.push(task);
    await board.save();

    return res.status(201).json({ success: true, data: { task, board } });
  } catch (error) {
    console.error("createTask failed", error);
    return res.status(500).json({ success: false, message: "Failed to create task" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.userId;
    const { title, description, assignedTo } = req.body || {};
    const status = normalizeStatus(req.body?.status);

    const access = await ensureProjectAccess(projectId, userId, res);
    if (!access) return;
    const { project, members } = access;

    const participantIds = [project.ownerId, ...(members || []).map((m) => m.userId).filter(Boolean)] as string[];
    if (assignedTo && !participantIds.includes(assignedTo)) {
      return res.status(400).json({ success: false, message: "Assigned user must be a project member" });
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const board = await ensureBoard(projectId);
    const task = board.tasks.find((t) => t.id === taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (title) task.title = String(title).trim();
    if (description !== undefined) task.description = String(description).trim();
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (status) task.status = status;
    task.updatedAt = new Date().toISOString();

    board.markModified("tasks");
    await board.save();

    return res.json({ success: true, data: { task, board } });
  } catch (error) {
    console.error("updateTask failed", error);
    return res.status(500).json({ success: false, message: "Failed to update task" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.userId;

    const access = await ensureProjectAccess(projectId, userId, res);
    if (!access) return;
    const { project, members } = access;

    const board = await ensureBoard(projectId);
    const initialLength = board.tasks.length;
    board.tasks = board.tasks.filter((t) => t.id !== taskId);

    if (board.tasks.length === initialLength) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    await board.save();
    return res.json({ success: true, data: { board } });
  } catch (error) {
    console.error("deleteTask failed", error);
    return res.status(500).json({ success: false, message: "Failed to delete task" });
  }
};

export const getWorkspaceChat = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;
      const access = await ensureProjectAccess(projectId, userId, res);
      if (!access) return;
      const { project, members } = access;

    const participantIds = [project.ownerId, ...(members || []).map((m) => m.userId).filter(Boolean)] as string[];
    const memberMap = await loadMembers(participantIds);
    const chat = await ensureProjectChat(projectId, participantIds, memberMap);

      const mappedMembers = participantIds.map((id) => {
        const info = memberMap.get(id) || {};
        const memberRecord = (members || []).find((m) => m.userId === id);
        return {
          id,
          name: info.name || "Member",
          avatar: info.avatar || "",
          role: id === project.ownerId ? "Project Owner" : memberRecord?.role || "Member",
          isOwner: id === project.ownerId,
        };
      });

      return res.json({ success: true, data: { messages: chat?.messages || [], members: mappedMembers } });
  } catch (error) {
    console.error("getWorkspaceChat failed", error);
    return res.status(500).json({ success: false, message: "Failed to load chat" });
  }
};

export const sendWorkspaceMessage = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;
    const { text } = req.body || {};

    const access = await ensureProjectAccess(projectId, userId, res);
    if (!access) return;
    const { project, members } = access;

    if (!text || !String(text).trim()) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    const sanitized = String(text).trim().slice(0, 2000);

    const participantIds = [project.ownerId, ...(members || []).map((m) => m.userId).filter(Boolean)] as string[];
    const memberMap = await loadMembers(participantIds);
    const chat = await ensureProjectChat(projectId, participantIds, memberMap);
    const sender = userId ? memberMap.get(userId) : null;

    const message = {
      id: `m-${Date.now()}`,
      senderId: userId as string,
      text: sanitized,
      timestamp: new Date().toISOString(),
      senderName: sender?.name,
      senderAvatar: sender?.avatar,
    } as const;

    chat.messages.push(message);
    await chat.save();

    return res.status(201).json({ success: true, data: { chat } });
  } catch (error) {
    console.error("sendWorkspaceMessage failed", error);
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
};
