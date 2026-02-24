import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WorkspaceTask, WorkspaceMember } from "@/data/workspaceData";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: WorkspaceTask | null; // null = create
  members: WorkspaceMember[];
  onSave: (task: WorkspaceTask) => void;
}

const STATUSES: { value: WorkspaceTask["status"]; label: string }[] = [
  { value: "todo", label: "To-Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const TaskModal = ({ open, onOpenChange, task, members, onSave }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>("unassigned");
  const [status, setStatus] = useState<WorkspaceTask["status"]>("todo");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setAssignedTo(task.assignedTo || "unassigned");
      setStatus(task.status);
    } else {
      setTitle("");
      setDescription("");
      setAssignedTo("unassigned");
      setStatus("todo");
    }
  }, [task, open]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      id: task?.id || `t-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      assignedTo: assignedTo === "unassigned" ? null : assignedTo,
      status,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title *</Label>
            <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea id="task-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the task..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Assign to</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as WorkspaceTask["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            {task ? "Save Changes" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
