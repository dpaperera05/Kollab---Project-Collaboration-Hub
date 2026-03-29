import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import KanbanColumn from "./KanbanColumn";
import TaskModal from "./TaskModal";
import type { WorkspaceTask, WorkspaceMember } from "@/data/workspaceData";
import { toast } from "@/hooks/use-toast";
import { apiDelete, apiPatch, apiPost } from "@/lib/api";

interface Props {
  projectId: string;
  initialTasks: WorkspaceTask[];
  members: WorkspaceMember[];
}

const KanbanBoard = ({ projectId, initialTasks, members }: Props) => {
  const [tasks, setTasks] = useState<WorkspaceTask[]>(initialTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkspaceTask | null>(null);
  const [saving, setSaving] = useState(false);

  const columns: { title: string; status: WorkspaceTask["status"]; accent: string }[] = [
    { title: "To-Do", status: "todo", accent: "bg-amber-500" },
    { title: "In Progress", status: "in-progress", accent: "bg-blue-500" },
    { title: "Done", status: "done", accent: "bg-emerald-500" },
  ];

  const handleSave = async (task: WorkspaceTask) => {
    setSaving(true);
    try {
      if (editingTask) {
        const res = await apiPatch<{ success: boolean; data: { task: WorkspaceTask; board: { tasks: WorkspaceTask[] } } }>(
          `/workspace/${projectId}/tasks/${task.id}`,
          {
            title: task.title,
            description: task.description,
            assignedTo: task.assignedTo,
            status: task.status,
          }
        );
        setTasks(res.data.board.tasks);
        toast({ title: "Task updated" });
      } else {
        const res = await apiPost<{ success: boolean; data: { task: WorkspaceTask; board: { tasks: WorkspaceTask[] } } }>(
          `/workspace/${projectId}/tasks`,
          {
            title: task.title,
            description: task.description,
            assignedTo: task.assignedTo,
            status: task.status,
          }
        );
        setTasks(res.data.board.tasks);
        toast({ title: "Task created" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Could not save task", variant: "destructive" });
    } finally {
      setEditingTask(null);
      setSaving(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    setSaving(true);
    try {
      const res = await apiDelete<{ success: boolean; data: { board: { tasks: WorkspaceTask[] } } }>(`/workspace/${projectId}/tasks/${taskId}`);
      setTasks(res.data.board.tasks);
      toast({ title: "Task deleted" });
    } catch (error) {
      console.error(error);
      toast({ title: "Could not delete task", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: WorkspaceTask["status"]) => {
    setSaving(true);
    try {
      const res = await apiPatch<{ success: boolean; data: { task: WorkspaceTask; board: { tasks: WorkspaceTask[] } } }>(
        `/workspace/${projectId}/tasks/${taskId}`,
        { status }
      );
      setTasks(res.data.board.tasks);
    } catch (error) {
      console.error(error);
      toast({ title: "Could not update status", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (task: WorkspaceTask) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-foreground">Kanban Board</h2>
        <Button size="sm" onClick={openCreate} className="gap-1.5">
          <Plus size={14} /> New Task
        </Button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {columns.map((col) => (
          <KanbanColumn
            key={col.status}
            title={col.title}
            status={col.status}
            accentClass={col.accent}
            tasks={tasks.filter((t) => t.status === col.status)}
            members={members}
            onEdit={openEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            saving={saving}
          />
        ))}
      </div>
      <TaskModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        task={editingTask}
        members={members}
        onSave={handleSave}
      />
    </div>
  );
};

export default KanbanBoard;
