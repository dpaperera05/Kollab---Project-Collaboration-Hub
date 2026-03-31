import { Schema, model, Document } from "mongoose";

export type WorkspaceStatus = "todo" | "in-progress" | "done";

export interface IWorkspaceTask {
  id: string;
  title: string;
  description: string;
  assignedTo?: string | null;
  status: WorkspaceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IWorkspaceBoard extends Document {
  projectId: string;
  tasks: IWorkspaceTask[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<IWorkspaceTask>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    assignedTo: { type: String, default: null },
    status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo", index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const workspaceSchema = new Schema<IWorkspaceBoard>(
  {
    projectId: { type: String, ref: "Project", required: true, unique: true, index: true },
    tasks: [taskSchema],
  },
  { timestamps: true }
);

export const WorkspaceBoard = model<IWorkspaceBoard>("WorkspaceBoard", workspaceSchema);
