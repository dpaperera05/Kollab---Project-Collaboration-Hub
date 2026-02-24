import { cn } from "@/lib/utils";
import { MessageSquare, LayoutGrid, Users, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { WorkspaceProject } from "@/data/workspaceData";

type Tab = "chat" | "kanban";

interface Props {
  project: WorkspaceProject;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  collapsed: boolean;
  onCollapse: () => void;
  onShowMembers: () => void;
}

const navItems: { id: Tab; label: string; icon: typeof MessageSquare }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "kanban", label: "Kanban Board", icon: LayoutGrid },
];

const WorkspaceSidebar = ({ project, activeTab, onTabChange, collapsed, onCollapse, onShowMembers }: Props) => {
  const visibleMembers = project.members.slice(0, 5);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar transition-all duration-200 shrink-0",
        collapsed ? "w-0 overflow-hidden lg:w-14" : "w-64"
      )}
    >
      {/* Collapse toggle (desktop) */}
      <div className="hidden lg:flex items-center justify-end p-2">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCollapse}>
          <ChevronLeft size={14} className={cn("transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {!collapsed && (
        <>
          {/* Project summary */}
          <div className="px-4 pb-4 border-b border-sidebar-border">
            <h3 className="text-sm font-semibold text-sidebar-foreground truncate">{project.title}</h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="outline" className="text-[10px]">{project.status}</Badge>
              {project.domain.map((d) => (
                <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">{project.members.length} members</p>
          </div>

          {/* Nav tabs */}
          <nav className="flex flex-col gap-0.5 p-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === item.id
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Members preview */}
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-sidebar-foreground">Members</span>
              <button
                className="text-[11px] text-primary hover:underline"
                onClick={onShowMembers}
              >
                View all
              </button>
            </div>
            <div className="space-y-1.5">
              {visibleMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-semibold">
                      {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-sidebar-foreground truncate">{m.name}</span>
                  {m.isOwner && (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 ml-auto border-primary/30 text-primary">
                      Owner
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Collapsed icons */}
      {collapsed && (
        <div className="hidden lg:flex flex-col items-center gap-1 pt-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); if (collapsed) onCollapse(); }}
              className={cn(
                "p-2 rounded-lg transition-colors",
                activeTab === item.id ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              title={item.label}
            >
              <item.icon size={18} />
            </button>
          ))}
          <button
            className="p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 mt-auto mb-4"
            onClick={onShowMembers}
            title="Members"
          >
            <Users size={18} />
          </button>
        </div>
      )}
    </aside>
  );
};

export default WorkspaceSidebar;
