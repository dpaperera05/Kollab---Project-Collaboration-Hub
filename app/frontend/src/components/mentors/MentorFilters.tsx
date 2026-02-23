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

export interface MentorFilterState {
  expertise: string[];
  domain: string;
  languages: string[];
  rate: string;
}

interface MentorFiltersProps {
  filters: MentorFilterState;
  onChange: (f: MentorFilterState) => void;
  onClear: () => void;
}

const EXPERTISE = ["React", "Python", "TypeScript", "Node.js", "ML/AI", "System Design", "Kubernetes", "Docker", "UI/UX Design", "Figma", "Solidity", "Cybersecurity", "Next.js", "React Native", "SQL", "C++"];
const DOMAINS = ["All", "Software Engineering", "Data Science", "AI Research", "DevOps", "Product Management", "Design", "Cybersecurity", "Blockchain", "Robotics", "Mobile Development", "Frontend Engineering", "Cloud"];
const LANGUAGES = ["English", "Hindi", "Mandarin", "Spanish", "French", "Tamil", "Russian", "Korean", "Arabic", "Urdu", "Portuguese", "Norwegian"];
const RATES = ["All", "Free", "Paid"];

const SelectFilter = ({
  label, value, options, onChange,
}: { label: string; value: string; options: string[]; onChange: (v: string) => void }) => (
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
        <option key={o} value={o}>{o === "All" ? label : o}</option>
      ))}
    </select>
    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
  </div>
);

const ChipMultiSelect = ({
  label, options, selected, onChange,
}: { label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
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
          selected.length > 0 ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-foreground hover:border-primary/50"
        )}
      >
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">{selected.length}</span>
        )}
        <ChevronDown size={12} className="text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 w-64 rounded-xl border border-border bg-card shadow-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Select {label.toLowerCase()}</p>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => onChange(selected.includes(opt) ? selected.filter((t) => t !== opt) : [...selected, opt])}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                  selected.includes(opt) ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary/50"
                )}
              >{opt}</button>
            ))}
          </div>
          <button onClick={() => setOpen(false)} className="w-full text-xs text-center font-medium text-primary hover:text-primary/80 py-1.5 border-t border-border mt-1">Done</button>
        </div>
      )}
    </div>
  );
};

const ActiveChip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
    {label}
    <button onClick={onRemove} className="hover:text-primary/60 transition-colors"><X size={11} /></button>
  </span>
);

const FiltersContent = ({ filters, onChange, onClear }: MentorFiltersProps) => {
  const activeCount =
    filters.expertise.length +
    (filters.domain !== "All" ? 1 : 0) +
    filters.languages.length +
    (filters.rate !== "All" ? 1 : 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <ChipMultiSelect label="Expertise" options={EXPERTISE} selected={filters.expertise} onChange={(v) => onChange({ ...filters, expertise: v })} />
        <SelectFilter label="Domain" value={filters.domain} options={DOMAINS} onChange={(v) => onChange({ ...filters, domain: v })} />
        <ChipMultiSelect label="Language" options={LANGUAGES} selected={filters.languages} onChange={(v) => onChange({ ...filters, languages: v })} />
        <SelectFilter label="Rate" value={filters.rate} options={RATES} onChange={(v) => onChange({ ...filters, rate: v })} />
        {activeCount > 0 && (
          <button onClick={onClear} className="ml-auto flex items-center gap-1 h-9 px-3 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:border-border/80 transition-colors">
            <X size={12} /> Clear ({activeCount})
          </button>
        )}
      </div>

      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {filters.expertise.map((t) => <ActiveChip key={t} label={t} onRemove={() => onChange({ ...filters, expertise: filters.expertise.filter((x) => x !== t) })} />)}
          {filters.domain !== "All" && <ActiveChip label={`Domain: ${filters.domain}`} onRemove={() => onChange({ ...filters, domain: "All" })} />}
          {filters.languages.map((t) => <ActiveChip key={t} label={t} onRemove={() => onChange({ ...filters, languages: filters.languages.filter((x) => x !== t) })} />)}
          {filters.rate !== "All" && <ActiveChip label={`Rate: ${filters.rate}`} onRemove={() => onChange({ ...filters, rate: "All" })} />}
        </div>
      )}
    </div>
  );
};

const MentorFilters = (props: MentorFiltersProps) => (
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
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Filter Mentors</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4 overflow-y-auto">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Domain</label>
              <div className="flex flex-wrap gap-2">
                {DOMAINS.filter((d) => d !== "All").map((d) => (
                  <button
                    key={d}
                    onClick={() => props.onChange({ ...props.filters, domain: props.filters.domain === d ? "All" : d })}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      props.filters.domain === d ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
                    )}
                  >{d}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rate</label>
              <div className="flex gap-2">
                {RATES.filter((r) => r !== "All").map((r) => (
                  <button
                    key={r}
                    onClick={() => props.onChange({ ...props.filters, rate: props.filters.rate === r ? "All" : r })}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      props.filters.rate === r ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
                    )}
                  >{r}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Language</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      const langs = props.filters.languages.includes(l) ? props.filters.languages.filter((x) => x !== l) : [...props.filters.languages, l];
                      props.onChange({ ...props.filters, languages: langs });
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      props.filters.languages.includes(l) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
                    )}
                  >{l}</button>
                ))}
              </div>
            </div>
            <button onClick={props.onClear} className="w-full h-9 text-sm font-medium border border-border rounded-lg hover:border-primary/50 transition-colors">
              Clear All Filters
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </>
);

export default MentorFilters;
