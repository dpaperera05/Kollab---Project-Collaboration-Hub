import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";
import type { WorkspaceTask, WorkspaceMember } from "@/data/workspaceData";

interface Props {
  task: WorkspaceTask;
  members: WorkspaceMember[];
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: WorkspaceTask["status"]) => void;
}

const TaskCard = ({ task, members, onEdit, onDelete, onStatusChange }: Props) => {
  const assignee = members.find((m) => m.id === task.assignedTo);
  const initials = assignee
    ? assignee.name.split(" ").map((n) => n[0]).join("").slice(0, 2)
    : "?";

  return (
    <div className="rounded-lg border border-border bg-card p-3.5 card-shadow hover:card-shadow-hover transition-shadow group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-foreground leading-tight">{task.title}</h4>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
            <Pencil size={13} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {assignee ? (
            <>
              <Avatar className="h-5 w-5">
                <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">{assignee.name}</span>
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground italic">Unassigned</span>
          )}
        </div>
        <Select value={task.status} onValueChange={(v) => onStatusChange(v as WorkspaceTask["status"])}>
          <SelectTrigger className="h-6 text-[10px] w-auto min-w-[80px] px-2 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">To-Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TaskCard;
