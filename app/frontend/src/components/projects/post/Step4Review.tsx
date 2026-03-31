import { Button } from "@/components/ui/button";
import type { BasicsData } from "./Step1Basics";
import type { RoleData } from "./Step2Roles";
import type { SettingsData } from "./Step3Settings";
import { cn } from "@/lib/utils";
import { Rocket, CheckCircle2 } from "lucide-react";

interface Props {
  basics: BasicsData;
  roles: RoleData[];
  settings: SettingsData;
  isEditing?: boolean;
  isSubmitting?: boolean;
  onBack: () => void;
  onPublish: () => void;
}

const Chip = ({ label, accent }: { label: string; accent?: boolean }) => (
  <span className={cn(
    "px-2.5 py-1 rounded-full text-xs font-semibold border",
    accent
      ? "bg-accent-brand/10 text-accent-brand border-accent-brand/20"
      : "chip"
  )}>
    {label}
  </span>
);

const ReviewSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-3.5 bg-muted/30 border-b border-border">
      <span className="text-muted-foreground">{icon}</span>
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const MetaBadge = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col gap-0.5 rounded-xl bg-muted/40 p-3 border border-border">
    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
    <span className="text-sm font-bold text-foreground">{value}</span>
  </div>
);

const Step4Review = ({ basics, roles, settings, isEditing, isSubmitting, onBack, onPublish }: Props) => {
  const ctaLabel = isEditing ? "Save Changes" : "Publish Project";
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Ready banner */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="font-bold text-foreground text-sm">Almost there!</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Review everything below and hit <strong>Publish</strong> when you're ready. Your project will be visible to the Kollab community immediately.
          </p>
        </div>
      </div>

      {/* Hero poster + title */}
      <div className="rounded-2xl border border-border overflow-hidden shadow-card">
        {basics.posterPreviewUrl ? (
          <div className="relative">
            <img
              src={basics.posterPreviewUrl}
              alt="Project poster"
              className="w-full h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-white/70 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  {basics.projectType}
                </span>
                <span className="text-xs font-semibold text-white/70 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  {basics.domain}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-white leading-tight">{basics.title}</h2>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-muted/30">
            <h2 className="text-2xl font-extrabold text-foreground">{basics.title}</h2>
          </div>
        )}
      </div>

      {/* Overview */}
      <ReviewSection title="Project Overview" icon="📋">
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{basics.summary}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetaBadge label="Type" value={basics.projectType} />
          <MetaBadge label="Domain" value={basics.domain} />
          <MetaBadge label="Difficulty" value={basics.difficulty} />
          <MetaBadge label="Duration" value={basics.duration} />
          <MetaBadge label="Commitment" value={`${basics.weeklyHours} hrs/week`} />
          <MetaBadge label="Compensation" value={basics.compensation} />
        </div>
      </ReviewSection>

      {/* Technologies */}
      <ReviewSection title="Technologies" icon="⚡">
        <div className="flex flex-wrap gap-1.5">
          {basics.technologies.map((t) => <Chip key={t} label={t} />)}
        </div>
      </ReviewSection>

      {/* Tags */}
      {settings.tags.length > 0 && (
        <ReviewSection title="Tags" icon="🏷️">
          <div className="flex flex-wrap gap-1.5">
            {settings.tags.map((t) => <Chip key={t} label={t} accent />)}
          </div>
        </ReviewSection>
      )}

      {/* Deliverables */}
      {basics.deliverables.trim() && (
        <ReviewSection title="Deliverables" icon="✅">
          <ul className="space-y-2">
            {basics.deliverables.split("\n").filter(Boolean).map((d, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">✓</span>
                {d.trim()}
              </li>
            ))}
          </ul>
        </ReviewSection>
      )}

      {/* Problem Statement */}
      {basics.problemStatement.trim() && (
        <ReviewSection title="Problem Statement" icon="💡">
          <p className="text-sm text-muted-foreground leading-relaxed">{basics.problemStatement}</p>
        </ReviewSection>
      )}

      {/* Roles */}
      <ReviewSection title={`Roles · ${roles.length} open position${roles.length !== 1 ? "s" : ""}`} icon="👥">
        <div className="space-y-3">
          {roles.map((role, i) => (
            <div
              key={role.id}
              className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <span className="font-bold text-sm text-foreground">{role.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full border",
                    role.status === "Open"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-muted text-muted-foreground border-border"
                  )}>
                    {role.status}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {role.level} · {role.seats} seat{role.seats > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              {role.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {role.requiredSkills.map((s) => <Chip key={s} label={s} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      </ReviewSection>

      {/* Publish actions */}
      <div className="flex justify-between pt-2 pb-10">
        <Button variant="outline" onClick={onBack} className="px-6">← Back</Button>
        <Button
          onClick={onPublish}
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-brand px-10 font-bold gap-2"
        >
          <Rocket size={16} />
          {isSubmitting ? "Working..." : ctaLabel}
        </Button>
      </div>
    </div>
  );
};

export default Step4Review;
