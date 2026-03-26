import { Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { RoleData } from "./Step2Roles";

const SKILLS_POOL = [
  "React", "Vue", "TypeScript", "JavaScript", "Node.js", "Python",
  "FastAPI", "Django", "Go", "Java", "PostgreSQL", "MongoDB", "Redis",
  "Docker", "Kubernetes", "AWS", "TensorFlow", "PyTorch", "OpenAI",
  "TailwindCSS", "GraphQL", "REST", "MQTT", "ROS2", "C++",
  "Figma", "UI/UX", "SQL", "Data Visualization", "NLP", "Computer Vision",
];

const ROLE_TEMPLATES: Record<string, { title: string; skills: string[] }> = {
  "Frontend Developer": { title: "Frontend Developer", skills: ["React", "TypeScript", "TailwindCSS"] },
  "Backend Developer": { title: "Backend Developer", skills: ["Node.js", "PostgreSQL", "REST"] },
  "ML Engineer": { title: "ML Engineer", skills: ["Python", "TensorFlow", "NLP"] },
  "Data Analyst": { title: "Data Analyst", skills: ["Python", "SQL", "Data Visualization"] },
  "UI/UX Designer": { title: "UI/UX Designer", skills: ["Figma", "UI/UX"] },
  "DevOps Engineer": { title: "DevOps Engineer", skills: ["Docker", "Kubernetes", "AWS"] },
  "Full-Stack Developer": { title: "Full-Stack Developer", skills: ["React", "Node.js", "PostgreSQL"] },
};

const LEVELS = ["Junior", "Intermediate"];
const STATUSES = ["Open", "Filled"];

interface ChipPickerProps {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  accent?: boolean;
}

const ChipPicker = ({ options, selected, onChange, accent }: ChipPickerProps) => {
  const toggle = (t: string) =>
    onChange(selected.includes(t) ? selected.filter((x) => x !== t) : [...selected, t]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => toggle(t)}
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150",
            selected.includes(t)
              ? accent
                ? "bg-accent-brand text-white border-accent-brand"
                : "bg-primary text-primary-foreground border-primary shadow-brand-sm"
              : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:bg-primary-soft"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
};

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">⚠ {msg}</p> : null;

interface Props {
  role: RoleData;
  index: number;
  errors: Partial<Record<keyof RoleData, string>>;
  onChange: (updated: RoleData) => void;
  onDelete: () => void;
  canDelete: boolean;
}

const RoleCard = ({ role, index, errors, onChange, onDelete, canDelete }: Props) => {
  const set = (key: keyof RoleData, val: unknown) =>
    onChange({ ...role, [key]: val });

  const applyTemplate = (templateKey: string) => {
    if (!templateKey) return;
    const tmpl = ROLE_TEMPLATES[templateKey];
    if (tmpl) onChange({ ...role, title: tmpl.title, requiredSkills: tmpl.skills });
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
      {/* Card header bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{index + 1}</span>
          </div>
          <span className="text-sm font-bold text-foreground">
            {role.title || `Role #${index + 1}`}
          </span>
          {role.status === "Open" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Open
            </span>
          )}
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Delete role"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Template picker */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Quick Template <span className="font-normal">(optional — auto-fills title & skills)</span>
          </Label>
          <Select onValueChange={applyTemplate}>
            <SelectTrigger className="h-9 text-sm bg-muted/40 border-dashed">
              <SelectValue placeholder="Choose a template to get started..." />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(ROLE_TEMPLATES).map((k) => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Label>
            Role Title <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="e.g. Frontend Developer"
            value={role.title}
            onChange={(e) => set("title", e.target.value)}
            className={cn("font-medium", errors.title ? "border-destructive" : "")}
          />
          <FieldError msg={errors.title} />
        </div>

        {/* Responsibilities */}
        <div className="space-y-1.5">
          <Label>
            Responsibilities <span className="text-destructive">*</span>
          </Label>
          <Textarea
            placeholder={"One responsibility per line:\nBuild UI components\nIntegrate API endpoints"}
            rows={3}
            value={role.responsibilities}
            onChange={(e) => set("responsibilities", e.target.value)}
            className={errors.responsibilities ? "border-destructive" : ""}
          />
          <FieldError msg={errors.responsibilities} />
        </div>

        {/* Required Skills */}
        <div className="space-y-2">
          <Label>
            Required Skills <span className="text-destructive">*</span>
          </Label>
          <ChipPicker
            options={SKILLS_POOL}
            selected={role.requiredSkills}
            onChange={(v) => set("requiredSkills", v)}
          />
          {role.requiredSkills.length > 0 && (
            <p className="text-xs text-muted-foreground">{role.requiredSkills.length} selected</p>
          )}
          <FieldError msg={errors.requiredSkills} />
        </div>

        {/* Nice-to-have */}
        <div className="space-y-2">
          <Label className="text-sm">
            Nice-to-have Skills{" "}
            <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </Label>
          <ChipPicker
            options={SKILLS_POOL}
            selected={role.niceToHaveSkills}
            onChange={(v) => set("niceToHaveSkills", v)}
            accent
          />
        </div>

        {/* Level + Seats + Status */}
        <div className="grid grid-cols-3 gap-3 pt-1 border-t border-border">
          <div className="space-y-1.5">
            <Label className="text-xs">
              Level <span className="text-destructive">*</span>
            </Label>
            <Select value={role.level} onValueChange={(v) => set("level", v)}>
              <SelectTrigger className={cn("h-9 text-sm", errors.level ? "border-destructive" : "")}>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <FieldError msg={errors.level} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Seats <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              min={1}
              max={20}
              placeholder="1"
              value={role.seats || ""}
              onChange={(e) => set("seats", Number(e.target.value))}
              className={cn("h-9 text-sm", errors.seats ? "border-destructive" : "")}
            />
            <FieldError msg={errors.seats} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={role.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleCard;
