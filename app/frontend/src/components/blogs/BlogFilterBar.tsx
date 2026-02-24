import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_BLOG_TAGS } from "@/data/blogTagOptions";
import { BLOG_SORT_OPTIONS } from "@/data/blogsData";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface BlogFilterState {
  tags: string[];
  sortBy: string;
}

interface Props {
  filters: BlogFilterState;
  onChange: (f: BlogFilterState) => void;
  onClear: () => void;
}

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
            {ALL_BLOG_TAGS.map((tag) => (
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
  const activeCount = filters.tags.length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <TagChips selected={filters.tags} onChange={(v) => onChange({ ...filters, tags: v })} />
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
              className={cn(
                "appearance-none h-9 pl-3 pr-8 text-xs font-medium rounded-lg border bg-card text-foreground cursor-pointer",
                "hover:border-primary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors",
                "border-border"
              )}
            >
              {BLOG_SORT_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>
          {activeCount > 0 && (
            <button onClick={onClear} className="flex items-center gap-1 h-9 px-3 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:border-border/80 transition-colors">
              <X size={12} /> Clear ({activeCount})
            </button>
          )}
        </div>
      </div>
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {filters.tags.map((t) => <ActiveChip key={t} label={t} onRemove={() => onChange({ ...filters, tags: filters.tags.filter((x) => x !== t) })} />)}
        </div>
      )}
    </div>
  );
};

const BlogFilterBar = (props: Props) => (
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
          <SheetHeader><SheetTitle>Filter Blogs</SheetTitle></SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</label>
              <div className="flex flex-wrap gap-2">
                {ALL_BLOG_TAGS.slice(0, 20).map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      props.onChange({
                        ...props.filters,
                        tags: props.filters.tags.includes(tag)
                          ? props.filters.tags.filter((t) => t !== tag)
                          : [...props.filters.tags, tag],
                      })
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      props.filters.tags.includes(tag)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {tag}
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

export default BlogFilterBar;
