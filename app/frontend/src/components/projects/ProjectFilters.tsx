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

export interface FilterState {
  domain: string;
  technologies: string[];
  roleType: string;
  difficulty: string;
  duration: string;
  status: string;
  sortBy: string;
  tags: string[];
}

interface ProjectFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
}

const DOMAINS = ["All", "AI & ML", "Software Engineering", "Robotics", "IoT", "Data Science", "Cybersecurity", "Web Dev", "Mobile Dev"];
const TECHNOLOGIES = ["React", "Node.js", "Python", "TensorFlow", "Docker", "PostgreSQL", "TypeScript", "Figma", "Kubernetes", "MongoDB", "PyTorch", "C++", "ROS2"];
const ROLE_TYPES = ["All", "Developer", "Designer", "Data Analyst", "DevOps", "PM", "Researcher"];
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];
const DURATIONS = ["All", "short-term", "long-term"];
const STATUSES = ["All", "Open", "Ongoing", "Filled", "Finished"];
const SORT_OPTIONS = ["Newest", "Oldest", "Most Relevant", "Top Rated"];
const POPULAR_TAGS = ["Hackathon", "Real-world", "Beginner-friendly", "Paid", "Open Source", "AI", "Research"];

const SelectFilter = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "appearance-none h-9 pl-3 pr-8 text-xs font-medium rounded-lg border bg-card text-foreground cursor-pointer",
        "hover:border-primary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors",
        value && value !== "All" ? "border-primary bg-primary/5 text-primary" : "border-border"
      )}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o === "All" ? label : o}
        </option>
      ))}
    </select>
    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
  </div>
);

const TechChips = ({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 h-9 pl-3 pr-3 text-xs font-medium rounded-lg border transition-colors",
          selected.length > 0
            ? "border-primary bg-primary/5 text-primary"
            : "border-border bg-card text-foreground hover:border-primary/50"
        )}
      >
        <span>Technologies</span>
        {selected.length > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
            {selected.length}
          </span>
        )}
        <ChevronDown size={12} className="text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 w-64 rounded-xl border border-border bg-card shadow-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Select technologies</p>
          <div className="flex flex-wrap gap-1.5">
            {TECHNOLOGIES.map((tech) => (
              <button
                key={tech}
                onClick={() => {
                  onChange(
                    selected.includes(tech)
                      ? selected.filter((t) => t !== tech)
                      : [...selected, tech]
                  );
                }}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                  selected.includes(tech)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-foreground hover:border-primary/50"
                )}
              >
                {tech}
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

const FiltersContent = ({
  filters,
  onChange,
  onClear,
}: ProjectFiltersProps) => {
  const activeCount =
    (filters.domain !== "All" ? 1 : 0) +
    filters.technologies.length +
    (filters.roleType !== "All" ? 1 : 0) +
    (filters.difficulty !== "All" ? 1 : 0) +
    (filters.duration !== "All" ? 1 : 0) +
    (filters.status !== "All" ? 1 : 0) +
    filters.tags.length;

  return (
    <div className="space-y-3">
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <SelectFilter
          label="Domain"
          value={filters.domain}
          options={DOMAINS}
          onChange={(v) => onChange({ ...filters, domain: v })}
        />
        <TechChips
          selected={filters.technologies}
          onChange={(v) => onChange({ ...filters, technologies: v })}
        />
        <SelectFilter
          label="Role Type"
          value={filters.roleType}
          options={ROLE_TYPES}
          onChange={(v) => onChange({ ...filters, roleType: v })}
        />
        <SelectFilter
          label="Difficulty"
          value={filters.difficulty}
          options={DIFFICULTIES}
          onChange={(v) => onChange({ ...filters, difficulty: v })}
        />
        <SelectFilter
          label="Duration"
          value={filters.duration}
          options={DURATIONS}
          onChange={(v) => onChange({ ...filters, duration: v })}
        />
        <SelectFilter
          label="Status"
          value={filters.status}
          options={STATUSES}
          onChange={(v) => onChange({ ...filters, status: v })}
        />
        <div className="ml-auto flex items-center gap-2">
          <SelectFilter
            label="Sort"
            value={filters.sortBy}
            options={SORT_OPTIONS}
            onChange={(v) => onChange({ ...filters, sortBy: v })}
          />
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 h-9 px-3 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:border-border/80 transition-colors"
            >
              <X size={12} />
              Clear ({activeCount})
            </button>
          )}
        </div>
      </div>

      {/* Popular tags row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">Tags:</span>
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              onChange({
                ...filters,
                tags: filters.tags.includes(tag)
                  ? filters.tags.filter((t) => t !== tag)
                  : [...filters.tags, tag],
              });
            }}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
              filters.tags.includes(tag)
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {filters.domain !== "All" && (
            <ActiveChip label={`Domain: ${filters.domain}`} onRemove={() => onChange({ ...filters, domain: "All" })} />
          )}
          {filters.technologies.map((t) => (
            <ActiveChip key={t} label={t} onRemove={() => onChange({ ...filters, technologies: filters.technologies.filter((x) => x !== t) })} />
          ))}
          {filters.roleType !== "All" && (
            <ActiveChip label={`Role: ${filters.roleType}`} onRemove={() => onChange({ ...filters, roleType: "All" })} />
          )}
          {filters.difficulty !== "All" && (
            <ActiveChip label={filters.difficulty} onRemove={() => onChange({ ...filters, difficulty: "All" })} />
          )}
          {filters.duration !== "All" && (
            <ActiveChip label={filters.duration} onRemove={() => onChange({ ...filters, duration: "All" })} />
          )}
          {filters.status !== "All" && (
            <ActiveChip label={`Status: ${filters.status}`} onRemove={() => onChange({ ...filters, status: "All" })} />
          )}
          {filters.tags.map((t) => (
            <ActiveChip key={t} label={`#${t}`} onRemove={() => onChange({ ...filters, tags: filters.tags.filter((x) => x !== t) })} />
          ))}
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

const ProjectFilters = (props: ProjectFiltersProps) => {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <FiltersContent {...props} />
      </div>

      {/* Mobile: slide-over drawer */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
                <SlidersHorizontal size={15} className="text-primary" />
                Filters
                {(props.filters.domain !== "All" ||
                  props.filters.technologies.length > 0 ||
                  props.filters.difficulty !== "All" ||
                  props.filters.status !== "All") && (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {[
                      props.filters.domain !== "All",
                      props.filters.technologies.length > 0,
                      props.filters.difficulty !== "All",
                      props.filters.status !== "All",
                    ].filter(Boolean).length}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Filter Projects</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4 overflow-y-auto">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Domain</label>
                  <div className="flex flex-wrap gap-2">
                    {DOMAINS.filter(d => d !== "All").map(d => (
                      <button
                        key={d}
                        onClick={() => props.onChange({ ...props.filters, domain: props.filters.domain === d ? "All" : d })}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                          props.filters.domain === d ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Difficulty</label>
                  <div className="flex gap-2">
                    {DIFFICULTIES.filter(d => d !== "All").map(d => (
                      <button
                        key={d}
                        onClick={() => props.onChange({ ...props.filters, difficulty: props.filters.difficulty === d ? "All" : d })}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                          props.filters.difficulty === d ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.filter(s => s !== "All").map(s => (
                      <button
                        key={s}
                        onClick={() => props.onChange({ ...props.filters, status: props.filters.status === s ? "All" : s })}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                          props.filters.status === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={props.onClear}
                    className="w-full h-9 text-sm font-medium border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
};

export default ProjectFilters;
