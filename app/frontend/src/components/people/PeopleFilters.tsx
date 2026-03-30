import { useState, useRef, useEffect } from "react";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface PeopleFilterState {
  preferredRoles: string[];
  skills: string[];
  techStack: string[];
  domainInterests: string[];
}

interface PeopleFiltersProps {
  filters: PeopleFilterState;
  onChange: (filters: PeopleFilterState) => void;
  onClear: () => void;
}

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Data Scientist",
  "ML Engineer",
  "DevOps Engineer",
  "Mobile Developer",
  "Product Manager",
  "Security Analyst",
  "Embedded Developer",
  "Robotics Engineer",
  "Blockchain Developer",
  "Game Developer",
  "Data Analyst",
  "Technical Writer",
  "3D Developer",
];

const SKILLS = [
  "System Design",
  "API Design",
  "Database Design",
  "Data Modeling",
  "Testing & QA",
  "Debugging",
  "Performance Tuning",
  "Security / Threat Modeling",
  "DevOps & CI/CD",
  "Cloud Architecture",
  "Observability",
  "Product Thinking",
  "Project Management",
  "Mentoring & Leadership",
  "Technical Writing",
  "UX Collaboration",
];

const TECH = [
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "NestJS",
  "Django",
  "FastAPI",
  "Spring Boot",
  "Kotlin",
  "Swift",
  "React Native",
  "Flutter",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Kafka",
  "GraphQL",
  "gRPC",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "Terraform",
  "Tailwind CSS",
  "Vite",
];
const DOMAINS = ["AI & ML", "Web Dev", "Mobile Dev", "Data Science", "Cybersecurity", "Robotics", "IoT", "Software Engineering"];

const ChipMultiFilter = ({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", handle); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 h-9 pl-3 pr-3 text-xs font-medium rounded-lg border transition-colors",
          selected.length > 0
            ? "border-primary bg-primary/5 text-primary"
            : "border-border bg-card text-foreground hover:border-primary/50"
        )}
      >
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
            {selected.length}
          </span>
        )}
        <ChevronDown size={12} className="text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 w-72 max-h-64 rounded-xl border border-border bg-card shadow-lg p-3 space-y-2 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground">Select {label.toLowerCase()}</p>
          <div className="flex flex-wrap gap-1.5">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => onChange(selected.includes(opt) ? selected.filter((t) => t !== opt) : [...selected, opt])}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                  selected.includes(opt)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-foreground hover:border-primary/50"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-full text-xs text-center font-medium text-primary hover:text-primary/80 py-1.5 border-t border-border mt-1"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

const ActiveChip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
    {label}
    <button onClick={onRemove} className="hover:text-primary/60 transition-colors">
      <X size={11} />
    </button>
  </span>
);

const FiltersContent = ({ filters, onChange, onClear }: PeopleFiltersProps) => {
  const activeCount = filters.preferredRoles.length + filters.skills.length + filters.techStack.length + filters.domainInterests.length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <ChipMultiFilter label="Roles" options={ROLES} selected={filters.preferredRoles} onChange={(v) => onChange({ ...filters, preferredRoles: v })} />
        <ChipMultiFilter label="Skills" options={SKILLS} selected={filters.skills} onChange={(v) => onChange({ ...filters, skills: v })} />
        <ChipMultiFilter label="Tech Stack" options={TECH} selected={filters.techStack} onChange={(v) => onChange({ ...filters, techStack: v })} />
        <ChipMultiFilter label="Domains" options={DOMAINS} selected={filters.domainInterests} onChange={(v) => onChange({ ...filters, domainInterests: v })} />
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 h-9 px-3 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:border-border/80 transition-colors ml-auto"
          >
            <X size={12} />
            Clear ({activeCount})
          </button>
        )}
      </div>

      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {filters.preferredRoles.map((r) => (
            <ActiveChip key={r} label={r} onRemove={() => onChange({ ...filters, preferredRoles: filters.preferredRoles.filter((x) => x !== r) })} />
          ))}
          {filters.skills.map((s) => (
            <ActiveChip key={s} label={s} onRemove={() => onChange({ ...filters, skills: filters.skills.filter((x) => x !== s) })} />
          ))}
          {filters.techStack.map((t) => (
            <ActiveChip key={t} label={t} onRemove={() => onChange({ ...filters, techStack: filters.techStack.filter((x) => x !== t) })} />
          ))}
          {filters.domainInterests.map((d) => (
            <ActiveChip key={d} label={d} onRemove={() => onChange({ ...filters, domainInterests: filters.domainInterests.filter((x) => x !== d) })} />
          ))}
        </div>
      )}
    </div>
  );
};

const MobileFilters = ({ filters, onChange, onClear }: PeopleFiltersProps) => {
  const sections = [
    { label: "Roles", options: ROLES, selected: filters.preferredRoles, key: "preferredRoles" as const },
    { label: "Skills", options: SKILLS, selected: filters.skills, key: "skills" as const },
    { label: "Tech Stack", options: TECH, selected: filters.techStack, key: "techStack" as const },
    { label: "Domains", options: DOMAINS, selected: filters.domainInterests, key: "domainInterests" as const },
  ];

  return (
    <div className="space-y-4">
      {sections.map((sec) => (
        <div key={sec.key} className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{sec.label}</label>
          <div className="flex flex-wrap gap-2">
            {sec.options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  const val = sec.selected.includes(opt) ? sec.selected.filter((x) => x !== opt) : [...sec.selected, opt];
                  onChange({ ...filters, [sec.key]: val });
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                  sec.selected.includes(opt) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={onClear} className="w-full h-9 text-sm font-medium border border-border rounded-lg hover:border-primary/50 transition-colors">
        Clear All Filters
      </button>
    </div>
  );
};

const PeopleFilters = (props: PeopleFiltersProps) => {
  const activeCount = props.filters.preferredRoles.length + props.filters.skills.length + props.filters.techStack.length + props.filters.domainInterests.length;

  return (
    <>
      <div className="hidden md:block">
        <FiltersContent {...props} />
      </div>
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
              <SlidersHorizontal size={15} className="text-primary" />
              Filters
              {activeCount > 0 && (
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {activeCount}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Filter People</SheetTitle>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto">
              <MobileFilters {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default PeopleFilters;
