import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import KanbanColumn from "./KanbanColumn";
import TaskModal from "./TaskModal";
import type { WorkspaceTask, WorkspaceMember } from "@/data/workspaceData";
import { toast } from "@/hooks/use-toast";

interface Props {
  initialTasks: WorkspaceTask[];
  members: WorkspaceMember[];
}

const KanbanBoard = ({ initialTasks, members }: Props) => {
  const [tasks, setTasks] = useState<WorkspaceTask[]>(initialTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkspaceTask | null>(null);

  const columns: { title: string; status: WorkspaceTask["status"]; accent: string }[] = [
    { title: "To-Do", status: "todo", accent: "bg-amber-500" },
    { title: "In Progress", status: "in-progress", accent: "bg-blue-500" },
    { title: "Done", status: "done", accent: "bg-green-500" },
  ];

  const handleSave = (task: WorkspaceTask) => {
    setTasks((prev) => {
      const exists = prev.find((t) => t.id === task.id);
      if (exists) return prev.map((t) => (t.id === task.id ? task : t));
      return [...prev, task];
    });
    toast({ title: editingTask ? "Task updated" : "Task created" });
    setEditingTask(null);
  };

  const handleDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    toast({ title: "Task deleted" });
  };

  const handleStatusChange = (taskId: string, status: WorkspaceTask["status"]) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
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
