import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { WorkspaceMember } from "@/data/workspaceData";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: WorkspaceMember[];
}

const MembersModal = ({ open, onOpenChange, members }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Team Members ({members.length})</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.role}</p>
            </div>
            {m.isOwner && (
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                Owner
              </Badge>
            )}
            <span className="h-2 w-2 rounded-full bg-primary/60 shrink-0" title="Online" />
          </div>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);

export default MembersModal;
