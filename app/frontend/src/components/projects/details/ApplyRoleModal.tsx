import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ApplyRoleModalProps {
  open: boolean;
  onClose: () => void;
  roleTitle: string;
  projectTitle: string;
}

const ApplyRoleModal = ({ open, onClose, roleTitle, projectTitle }: ApplyRoleModalProps) => {
  const [motivation, setMotivation] = useState("");
  const [links, setLinks] = useState<string[]>(["", ""]);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const addLink = () => setLinks((prev) => [...prev, ""]);
  const removeLink = (i: number) => setLinks((prev) => prev.filter((_, idx) => idx !== i));
  const updateLink = (i: number, val: string) =>
    setLinks((prev) => prev.map((l, idx) => (idx === i ? val : l)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivation.trim()) return;
    if (!confirmed) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    toast({
      title: "Application submitted! 🎉",
      description: `Your application for ${roleTitle} has been sent to the project owner.`,
    });
    handleClose();
  };

  const handleClose = () => {
    setMotivation("");
    setLinks(["", ""]);
    setConfirmed(false);
    onClose();
  };

  const isValid = motivation.trim().length > 0 && confirmed;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground leading-snug">
            Apply for{" "}
            <span className="text-primary">{roleTitle}</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {projectTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-5">
          {/* Motivation */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Why do you want to join this project?{" "}
              <span className="text-destructive">*</span>
            </label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value.slice(0, 500))}
              placeholder="Tell the project owner what excites you about this project and what you'll bring to the team…"
              rows={5}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            <p className="text-xs text-muted-foreground text-right">{motivation.length}/500</p>
          </div>

          {/* Evidence Links */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Evidence Links{" "}
              <span className="text-xs text-muted-foreground font-normal">(GitHub, Behance, Notion…)</span>
            </label>
            <div className="space-y-2">
              {links.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => updateLink(i, e.target.value)}
                    placeholder={`https://github.com/your-work-${i + 1}`}
                    className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(i)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {links.length < 5 && (
              <button
                type="button"
                onClick={addLink}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium mt-1"
              >
                <Plus size={13} /> Add another link
              </button>
            )}
          </div>

          {/* Resume upload */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Resume{" "}
              <span className="text-xs text-muted-foreground font-normal">(optional, PDF)</span>
            </label>
            <div className="flex items-center justify-center w-full h-20 rounded-xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
              <label className="flex flex-col items-center gap-1 cursor-pointer w-full h-full justify-center">
                <span className="text-xs text-muted-foreground">Click to upload or drag & drop</span>
                <span className="text-[11px] text-muted-foreground/70">PDF, DOC, DOCX (max 5MB)</span>
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" />
              </label>
            </div>
          </div>

          {/* Confirmation */}
          <label className={cn(
            "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
            confirmed ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/40"
          )}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary accent-primary flex-shrink-0"
            />
            <span className="text-sm text-foreground/80 leading-snug">
              I confirm I can commit the mentioned weekly hours and understand this is a collaborative,
              unpaid learning project.
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || submitting}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {submitting ? "Submitting…" : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyRoleModal;
