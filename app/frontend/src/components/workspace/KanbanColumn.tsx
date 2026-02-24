import { cn } from "@/lib/utils";
import TaskCard from "./TaskCard";
import type { WorkspaceTask, WorkspaceMember } from "@/data/workspaceData";

interface Props {
  title: string;
  status: WorkspaceTask["status"];
  tasks: WorkspaceTask[];
  members: WorkspaceMember[];
  accentClass: string;
  onEdit: (task: WorkspaceTask) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: WorkspaceTask["status"]) => void;
}

const KanbanColumn = ({ title, tasks, members, accentClass, onEdit, onDelete, onStatusChange }: Props) => (
  <div className="flex flex-col min-w-[280px] max-w-sm flex-1">
    <div className="flex items-center gap-2 mb-3 px-1">
      <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", accentClass)} />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <span className="text-xs text-muted-foreground ml-auto">{tasks.length}</span>
    </div>
    <div className="flex-1 space-y-2.5 rounded-xl bg-muted/40 p-2.5 min-h-[200px]">
      {tasks.length === 0 ? (
        <div className="flex items-center justify-center h-24 text-xs text-muted-foreground italic">
          No tasks in this column
        </div>
      ) : (
        tasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            members={members}
            onEdit={() => onEdit(t)}
            onDelete={() => onDelete(t.id)}
            onStatusChange={(s) => onStatusChange(t.id, s)}
          />
        ))
      )}
    </div>
  </div>
);

export default KanbanColumn;
