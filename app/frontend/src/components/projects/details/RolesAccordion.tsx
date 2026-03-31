import { useState } from "react";
import { ChevronDown, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectRole } from "@/data/mockProjects";
import { Button } from "@/components/ui/button";
import ApplyRoleModal from "./ApplyRoleModal";

const LEVEL_CONFIG = {
  Junior: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" },
  Intermediate: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
  Senior: { color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800" },
};

const STATUS_CONFIG = {
  Open: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500" },
  Filled: { color: "text-muted-foreground", bg: "bg-muted border-border", dot: "bg-muted-foreground" },
};

interface RoleCardProps {
  role: ProjectRole;
  projectTitle: string;
  projectId: string;
  projectStatus?: "Open" | "Ongoing" | "Filled" | "Finished" | string;
  defaultOpen?: boolean;
}

const RoleCard = ({ role, projectTitle, projectId, projectStatus, defaultOpen = false }: RoleCardProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const [applyOpen, setApplyOpen] = useState(false);

  const levelConfig = LEVEL_CONFIG[role.level];
  const statusConfig = STATUS_CONFIG[role.status];
  const filledPct = Math.round((role.filled / role.total) * 100);
  const projectClosed = projectStatus === "Filled" || projectStatus === "Finished";
  const applyDisabled = role.status === "Filled" || projectClosed;
  const applyLabel = projectClosed
    ? projectStatus === "Finished" ? "Project Completed" : "Project Filled"
    : role.status === "Filled" ? "Role Filled" : "Apply for this Role";

  return (
    <>
      <div className={cn(
        "rounded-xl border transition-all duration-200 overflow-hidden",
        open ? "border-primary/30 bg-primary/2" : "border-border bg-card hover:border-border/70"
      )}>
        {/* Header (always visible) */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap size={14} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground leading-tight">{role.title}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold border", levelConfig.bg, levelConfig.color)}>
                  {role.level}
                </span>
                <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border", statusConfig.bg, statusConfig.color)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
                  {role.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="hidden sm:flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5">
                <Users size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">{role.filled}/{role.total} filled</span>
              </div>
              <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", role.filled === role.total ? "bg-muted-foreground" : "bg-primary")}
                  style={{ width: `${filledPct}%` }}
                />
              </div>
            </div>
            <ChevronDown
              size={16}
              className={cn("text-muted-foreground transition-transform duration-200", open && "rotate-180")}
            />
          </div>
        </button>

        {/* Expanded content */}
        {open && (
          <div className="px-5 pb-5 space-y-4 border-t border-border/50 pt-4">
            {/* Seats filled (mobile) */}
            <div className="sm:hidden flex items-center gap-2">
              <Users size={13} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{role.filled}/{role.total} seats filled</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full", role.filled === role.total ? "bg-muted-foreground" : "bg-primary")}
                  style={{ width: `${filledPct}%` }}
                />
              </div>
            </div>

            {/* Responsibilities */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Responsibilities</p>
              <ul className="space-y-1.5">
                {role.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {role.skills.map((s) => (
                  <span key={s} className="chip px-2.5 py-1 rounded-lg text-xs font-semibold">{s}</span>
                ))}
              </div>
            </div>

            {/* Nice-to-have */}
            {role.niceToHave && role.niceToHave.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Nice to Have</p>
                <div className="flex flex-wrap gap-1.5">
                  {role.niceToHave.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Apply */}
            <div className="pt-1">
              <Button
                onClick={() => !applyDisabled && setApplyOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-brand-sm"
                disabled={applyDisabled}
              >
                {applyLabel}
              </Button>
            </div>
          </div>
        )}
      </div>

      <ApplyRoleModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        roleTitle={role.title}
        projectTitle={projectTitle}
        projectId={projectId}
        projectStatus={projectStatus}
      />
    </>
  );
};

interface RolesAccordionProps {
  roles: ProjectRole[];
  projectTitle: string;
  projectId: string;
  projectStatus?: "Open" | "Ongoing" | "Filled" | "Finished" | string;
}

const RolesAccordion = ({ roles, projectTitle, projectId, projectStatus }: RolesAccordionProps) => {
  const openRoles = roles.filter((r) => r.status === "Open").length;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">
          Roles & Applications
        </h2>
        <span className="text-xs text-muted-foreground">
          {openRoles} open role{openRoles !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3">
        {roles.map((role, i) => (
          <RoleCard
            key={i}
            role={role}
            projectTitle={projectTitle}
            projectId={projectId}
            projectStatus={projectStatus}
            defaultOpen={i === 0 && role.status === "Open"}
          />
        ))}
      </div>
    </section>
  );
};

export default RolesAccordion;
