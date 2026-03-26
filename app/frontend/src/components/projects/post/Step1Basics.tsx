import { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export interface BasicsData {
  title: string;
  posterFile: File | null;
  posterPreviewUrl: string;
  summary: string;
  problemStatement: string;
  deliverables: string;
  projectType: string;
  domain: string;
  technologies: string[];
  difficulty: string;
  duration: string;
  weeklyHours: number;
  compensation: string;
}

const ALL_TECHS = [
  "React",
  "Next.js",
  "Vue.js",
  "Nuxt.js",
  "Angular",
  "Svelte",
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "Tailwind CSS",
  "Bootstrap",
  "Node.js",
  "Express.js",
  "NestJS",
  "Django",
  "Flask",
  "FastAPI",
  "Laravel",
  "Spring Boot",
  "ASP.NET Core",
  "PHP",
  "Java",
  "Python",
  "C#",
  "Go",
  "React Native",
  "Flutter",
  "Kotlin",
  "Swift",
  "MongoDB",
  "PostgreSQL",
  "SQLite",
  "Firebase",
  "Supabase",
  "Redis",
  "Oracle Database",
  "TensorFlow",
  "PyTorch",
  "Scikit-learn",
  "OpenCV",
  "Pandas",
  "NumPy",
  "Hugging Face",
  "LangChain",
  "R",
  "Jupyter",
  "MATLAB",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "Netlify",
  "Render",
  "Figma",
  "Adobe XD",
];

const DOMAINS = [
  "Software Engineering", "AI & ML", "IoT", "Robotics",
  "Data Science", "Cybersecurity", "Web Dev", "Mobile Dev",
];

const PROJECT_TYPES = [
  "Real-World Project",
  "Startup / Product Idea",
  "Hackathon Project",
  "Open Source Contribution",
  "Practice / Learning Project",
  "Research Project",
  "Prototype / MVP",
  "Competition Project",
  "Freelance Client Project",
  "Experimental / Exploration",
  "Community / Social Impact Project",
];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const DURATIONS = ["short-term", "long-term"];
const COMPENSATIONS = ["None", "Paid"];

interface Props {
  initialData: BasicsData | null;
  onNext: (data: BasicsData) => void;
  onCancel: () => void;
}

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">⚠ {msg}</p> : null;

const SectionCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("rounded-2xl border border-border bg-card p-8 shadow-card space-y-6", className)}>
    {children}
  </div>
);

const SectionTitle = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => (
  <div className="flex items-start gap-3 pb-2 border-b border-border">
    <span className="text-xl">{icon}</span>
    <div>
      <h3 className="font-bold text-foreground text-sm">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const ChipPicker = ({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
}) => {
  const toggle = (t: string) =>
    onChange(selected.includes(t) ? selected.filter((x) => x !== t) : [...selected, t]);

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => toggle(t)}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150",
            selected.includes(t)
              ? "bg-primary text-primary-foreground border-primary shadow-brand-sm"
              : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:bg-primary-soft"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
};

const Step1Basics = ({ initialData, onNext, onCancel }: Props) => {
  const [form, setForm] = useState<BasicsData>(
    initialData ?? {
      title: "",
      posterFile: null,
      posterPreviewUrl: "",
      summary: "",
      problemStatement: "",
      deliverables: "",
      projectType: "",
      domain: "",
      technologies: [],
      difficulty: "",
      duration: "",
      weeklyHours: 0,
      compensation: "",
    }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof BasicsData, string>>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof BasicsData, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleTitleChange = (value: string) => {
    const cleaned = value.replace(/[0-9]/g, "");
    set("title", cleaned);
    if (!cleaned.trim()) {
      setErrors((er) => ({ ...er, title: "Project title is required." }));
    } else if (cleaned.length !== value.length) {
      setErrors((er) => ({ ...er, title: "Numbers are not allowed in the title." }));
    } else {
      setErrors((er) => ({ ...er, title: undefined }));
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, posterFile: file, posterPreviewUrl: url }));
    setErrors((er) => ({ ...er, posterFile: undefined }));
  };

  const handleSummaryChange = (value: string) => {
    set("summary", value);
    setErrors((er) => ({ ...er, summary: value.trim() ? undefined : "Summary is required." }));
  };

  const handleProblemChange = (value: string) => {
    set("problemStatement", value);
    setErrors((er) => ({ ...er, problemStatement: value.trim() ? undefined : "Problem statement is required." }));
  };

  const handleDeliverablesChange = (value: string) => {
    set("deliverables", value);
    setErrors((er) => ({ ...er, deliverables: value.trim() ? undefined : "Deliverables are required." }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof BasicsData, string>> = {};
    if (!form.title.trim()) {
      errs.title = "Project title is required.";
    } else if (/\d/.test(form.title)) {
      errs.title = "Numbers are not allowed in the title.";
    }
    if (!form.posterPreviewUrl) errs.posterFile = "Please upload a project poster.";
    if (!form.summary.trim()) errs.summary = "Summary is required.";
    if (!form.problemStatement.trim()) errs.problemStatement = "Problem statement is required.";
    if (!form.deliverables.trim()) errs.deliverables = "Deliverables are required.";
    if (!form.projectType) errs.projectType = "Select a project type.";
    if (!form.domain) errs.domain = "Select a domain.";
    if (form.technologies.length === 0) errs.technologies = "Select at least one technology.";
    if (!form.difficulty) errs.difficulty = "Select a difficulty level.";
    if (!form.duration) errs.duration = "Select a duration.";
    if (!form.weeklyHours || form.weeklyHours < 1) errs.weeklyHours = "Enter weekly commitment.";
    if (!form.compensation) errs.compensation = "Select compensation type.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext(form);
  };

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Identity card */}
      <SectionCard>
        <SectionTitle icon="🎯" title="Project Identity" subtitle="Give your project a clear name and eye-catching poster." />

        <div className="space-y-1.5">
          <Label htmlFor="title">
            Project Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="e.g. AI-Powered Resume Analyzer"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={cn("text-base font-medium", errors.title ? "border-destructive" : "")}
          />
          <FieldError msg={errors.title} />
        </div>

        {/* Poster Upload */}
        <div className="space-y-1.5">
          <Label>
            Project Poster <span className="text-destructive">*</span>
          </Label>
          <div
            className={cn(
              "relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer group overflow-hidden",
              errors.posterFile
                ? "border-destructive bg-destructive/5"
                : form.posterPreviewUrl
                ? "border-primary/30"
                : "border-border hover:border-primary/50 hover:bg-primary-soft"
            )}
            onClick={() => fileRef.current?.click()}
          >
            {form.posterPreviewUrl ? (
              <div className="relative">
                <img
                  src={form.posterPreviewUrl}
                  alt="Poster preview"
                  className="w-full h-52 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setForm((f) => ({ ...f, posterFile: null, posterPreviewUrl: "" }));
                    setErrors((er) => ({ ...er, posterFile: "Please upload a project poster." }));
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <X size={14} />
                </button>
                <div className="absolute bottom-3 left-3">
                  <span className="text-xs font-semibold text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <ImageIcon size={11} /> Click to change
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Upload size={22} className="text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">Drop your poster here</p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse — PNG, JPG up to 10MB</p>
                </div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <FieldError msg={errors.posterFile} />
        </div>
      </SectionCard>

      {/* Description card */}
      <SectionCard>
        <SectionTitle icon="📝" title="Project Description" subtitle="Help collaborators understand what you're building and why." />

        <div className="space-y-1.5">
          <Label htmlFor="summary">
            Summary <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="summary"
            placeholder="A one-paragraph overview of your project..."
            rows={3}
            value={form.summary}
            onChange={(e) => handleSummaryChange(e.target.value)}
            className={errors.summary ? "border-destructive" : ""}
          />
          <FieldError msg={errors.summary} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="problem">
            Problem Statement <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="problem"
            placeholder="What problem does this project solve?"
            rows={3}
            value={form.problemStatement}
            onChange={(e) => handleProblemChange(e.target.value)}
          />
          <FieldError msg={errors.problemStatement} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deliverables">
            Deliverables <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="deliverables"
            placeholder={"One deliverable per line:\nWorking REST API\nReact frontend dashboard\nDocumentation"}
            rows={4}
            value={form.deliverables}
            onChange={(e) => handleDeliverablesChange(e.target.value)}
            className={errors.deliverables ? "border-destructive" : ""}
          />
          <p className="text-xs text-muted-foreground">Enter one deliverable per line.</p>
          <FieldError msg={errors.deliverables} />
        </div>
      </SectionCard>

      {/* Classification card */}
      <SectionCard>
        <SectionTitle icon="🗂️" title="Project Classification" subtitle="Help others find and filter your project." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>
              Project Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.projectType}
              onValueChange={(v) => {
                set("projectType", v);
                setErrors((er) => ({ ...er, projectType: undefined }));
              }}
            >
              <SelectTrigger className={errors.projectType ? "border-destructive" : ""}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <FieldError msg={errors.projectType} />
          </div>

          <div className="space-y-1.5">
            <Label>
              Domain <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.domain}
              onValueChange={(v) => {
                set("domain", v);
                setErrors((er) => ({ ...er, domain: undefined }));
              }}
            >
              <SelectTrigger className={errors.domain ? "border-destructive" : ""}>
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                {DOMAINS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <FieldError msg={errors.domain} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Technologies <span className="text-destructive">*</span>
          </Label>
          <ChipPicker
            options={ALL_TECHS}
            selected={form.technologies}
            onChange={(v) => {
              set("technologies", v);
              setErrors((er) => ({ ...er, technologies: v.length ? undefined : "Select at least one technology." }));
            }}
          />
          {form.technologies.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {form.technologies.length} selected
            </p>
          )}
          <FieldError msg={errors.technologies} />
        </div>
      </SectionCard>

      {/* Logistics card */}
      <SectionCard>
        <SectionTitle icon="⚙️" title="Project Logistics" subtitle="Set the scope, pace, and compensation for collaborators." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>
              Difficulty <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.difficulty}
              onValueChange={(v) => {
                set("difficulty", v);
                setErrors((er) => ({ ...er, difficulty: undefined }));
              }}
            >
              <SelectTrigger className={errors.difficulty ? "border-destructive" : ""}>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <FieldError msg={errors.difficulty} />
          </div>

          <div className="space-y-1.5">
            <Label>
              Duration <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.duration}
              onValueChange={(v) => {
                set("duration", v);
                setErrors((er) => ({ ...er, duration: undefined }));
              }}
            >
              <SelectTrigger className={errors.duration ? "border-destructive" : ""}>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <FieldError msg={errors.duration} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hours">
              Weekly Commitment <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="hours"
                type="number"
                min={1}
                max={80}
                placeholder="8"
                value={form.weeklyHours || ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  set("weeklyHours", val);
                  setErrors((er) => ({ ...er, weeklyHours: val >= 1 ? undefined : "Enter weekly commitment." }));
                }}
                className={cn("pr-20", errors.weeklyHours ? "border-destructive" : "")}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">hrs/week</span>
            </div>
            <FieldError msg={errors.weeklyHours} />
          </div>

          <div className="space-y-1.5">
            <Label>
              Compensation <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.compensation}
              onValueChange={(v) => {
                set("compensation", v);
                setErrors((er) => ({ ...er, compensation: undefined }));
              }}
            >
              <SelectTrigger className={errors.compensation ? "border-destructive" : ""}>
                <SelectValue placeholder="Select compensation" />
              </SelectTrigger>
              <SelectContent>
                {COMPENSATIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <FieldError msg={errors.compensation} />
          </div>
        </div>
      </SectionCard>

      {/* Navigation */}
      <div className="flex justify-between pt-2 pb-10">
        <Button variant="outline" onClick={onCancel} className="px-6">
          Cancel
        </Button>
        <Button
          onClick={handleNext}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-brand px-8 font-bold"
        >
          Next: Add Roles →
        </Button>
      </div>
    </div>
  );
};

export default Step1Basics;
