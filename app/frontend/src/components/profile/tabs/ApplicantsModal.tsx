import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Check, X, ExternalLink } from "lucide-react";
import { type MockApplicant } from "@/data/mockProfileContent";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  applicants: MockApplicant[];
  onUpdateApplicant: (id: string, status: "approved" | "rejected", reason?: string) => void;
}

const STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  approved: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

const ApplicantsModal = ({ open, onOpenChange, projectTitle, applicants, onUpdateApplicant }: Props) => {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const handleApprove = (id: string) => {
    onUpdateApplicant(id, "approved");
    toast({ title: "Applicant approved", description: "Email notification sent to applicant (simulated)." });
  };

  const handleReject = (id: string) => {
    if (!reason.trim()) {
      toast({ title: "Rejection reason required", variant: "destructive" });
      return;
    }
    onUpdateApplicant(id, "rejected", reason.trim());
    toast({ title: "Applicant rejected", description: "Email notification sent to applicant (simulated)." });
    setRejectingId(null);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Applicants — {projectTitle}</DialogTitle>
        </DialogHeader>
        {applicants.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No applicants yet.</p>
        ) : (
          <div className="space-y-4 pt-2">
            {applicants.map(a => (
              <div key={a.id} className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground">Applied for: {a.role}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-xs capitalize", STATUS_STYLES[a.status])}>{a.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{a.motivation}</p>
                <div className="flex gap-2 text-xs">
                  {a.links.github && (
                    <a href={a.links.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      <ExternalLink size={10} /> GitHub
                    </a>
                  )}
                  {a.links.linkedin && (
                    <a href={a.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      <ExternalLink size={10} /> LinkedIn
                    </a>
                  )}
                </div>
                {a.status === "pending" && (
                  <>
                    {rejectingId === a.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={reason}
                          onChange={e => setReason(e.target.value)}
                          placeholder="Reason for rejection (required)..."
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="destructive" onClick={() => handleReject(a.id)}>Confirm Reject</Button>
                          <Button size="sm" variant="outline" onClick={() => { setRejectingId(null); setReason(""); }}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" className="gap-1" onClick={() => handleApprove(a.id)}><Check size={12} /> Approve</Button>
                        <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => setRejectingId(a.id)}><X size={12} /> Reject</Button>
                      </div>
                    )}
                  </>
                )}
                {a.status === "rejected" && a.rejectionReason && (
                  <p className="text-xs text-muted-foreground italic">Reason: {a.rejectionReason}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApplicantsModal;
