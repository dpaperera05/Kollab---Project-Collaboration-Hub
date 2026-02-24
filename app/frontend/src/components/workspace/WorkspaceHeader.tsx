import { ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { WorkspaceProject } from "@/data/workspaceData";

const STATUS_COLORS: Record<string, string> = {
  Open: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Ongoing: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  Filled: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  Finished: "bg-muted text-muted-foreground border-border",
};

interface Props {
  project: WorkspaceProject;
  onShowMembers: () => void;
}

const WorkspaceHeader = ({ project, onShowMembers }: Props) => {
  const navigate = useNavigate();
  const visibleMembers = project.members.slice(0, 4);
  const extra = project.members.length - visibleMembers.length;

  return (
    <div className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
      </Button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-base font-semibold text-foreground truncate">{project.title}</h1>
          <Badge variant="outline" className={STATUS_COLORS[project.status]}>
            {project.status}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex -space-x-2 cursor-pointer" onClick={onShowMembers}>
          {visibleMembers.map((m) => (
            <Avatar key={m.id} className="h-7 w-7 border-2 border-card">
              <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-semibold">
                {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          ))}
          {extra > 0 && (
            <Avatar className="h-7 w-7 border-2 border-card">
              <AvatarFallback className="bg-muted text-muted-foreground text-[9px]">
                +{extra}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs hidden sm:flex" onClick={onShowMembers}>
          <Users size={13} /> {project.members.length} members
        </Button>
      </div>
    </div>
  );
};

export default WorkspaceHeader;
