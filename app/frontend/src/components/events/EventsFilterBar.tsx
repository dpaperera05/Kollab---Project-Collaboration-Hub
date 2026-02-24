import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_TYPES, EVENT_TAGS, EVENT_LOCATIONS, EVENT_SORT } from "@/data/eventsData";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface EventFilterState {
  type: string;
  tags: string[];
  location: string;
  sortBy: string;
  dateRange: string;
}

interface Props {
  filters: EventFilterState;
  onChange: (f: EventFilterState) => void;
  onClear: () => void;
}

const SelectFilter = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[] | string[];
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
      <option value="All">{label}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
  </div>
);

const TagChips = ({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const click = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", click);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", click); document.removeEventListener("keydown", esc); };
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
        <span>Tags</span>
        {selected.length > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
            {selected.length}
          </span>
        )}
        <ChevronDown size={12} className="text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 w-72 rounded-xl border border-border bg-card shadow-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Select tags</p>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {EVENT_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag])}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                  selected.includes(tag)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-foreground hover:border-primary/50"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
          <button onClick={() => setOpen(false)} className="w-full text-xs text-center font-medium text-primary hover:text-primary/80 py-1.5 border-t border-border mt-1">
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
    <button onClick={onRemove} className="hover:text-primary/60 transition-colors"><X size={11} /></button>
  </span>
);

const FiltersContent = ({ filters, onChange, onClear }: Props) => {
  const activeCount =
    (filters.type !== "All" ? 1 : 0) +
    filters.tags.length +
    (filters.location !== "All" ? 1 : 0) +
    (filters.dateRange !== "All" ? 1 : 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SelectFilter label="Type" value={filters.type} options={EVENT_TYPES} onChange={(v) => onChange({ ...filters, type: v })} />
        <TagChips selected={filters.tags} onChange={(v) => onChange({ ...filters, tags: v })} />
        <SelectFilter label="Location" value={filters.location} options={EVENT_LOCATIONS} onChange={(v) => onChange({ ...filters, location: v })} />
        <SelectFilter label="Date Range" value={filters.dateRange} options={["This week", "This month"]} onChange={(v) => onChange({ ...filters, dateRange: v })} />
        <div className="ml-auto flex items-center gap-2">
          <SelectFilter label="Sort" value={filters.sortBy} options={EVENT_SORT} onChange={(v) => onChange({ ...filters, sortBy: v })} />
          {activeCount > 0 && (
            <button onClick={onClear} className="flex items-center gap-1 h-9 px-3 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:border-border/80 transition-colors">
              <X size={12} /> Clear ({activeCount})
            </button>
          )}
        </div>
      </div>
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {filters.type !== "All" && <ActiveChip label={`Type: ${filters.type}`} onRemove={() => onChange({ ...filters, type: "All" })} />}
          {filters.location !== "All" && <ActiveChip label={`Location: ${filters.location}`} onRemove={() => onChange({ ...filters, location: "All" })} />}
          {filters.dateRange !== "All" && <ActiveChip label={filters.dateRange} onRemove={() => onChange({ ...filters, dateRange: "All" })} />}
          {filters.tags.map((t) => <ActiveChip key={t} label={t} onRemove={() => onChange({ ...filters, tags: filters.tags.filter((x) => x !== t) })} />)}
        </div>
      )}
    </div>
  );
};

const EventsFilterBar = (props: Props) => (
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
          <SheetHeader><SheetTitle>Filter Events</SheetTitle></SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map((t) => (
                  <button key={t} onClick={() => props.onChange({ ...props.filters, type: props.filters.type === t ? "All" : t })}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", props.filters.type === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50")}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
              <div className="flex gap-2">
                {EVENT_LOCATIONS.map((l) => (
                  <button key={l} onClick={() => props.onChange({ ...props.filters, location: props.filters.location === l ? "All" : l })}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", props.filters.location === l ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50")}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={props.onClear} className="w-full h-9 text-sm font-medium border border-border rounded-lg hover:border-primary/50 transition-colors">
              Clear All
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </>
);

export default EventsFilterBar;
