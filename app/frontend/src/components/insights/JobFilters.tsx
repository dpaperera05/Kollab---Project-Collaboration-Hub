import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { JobFilters as FilterOptions } from "@/data/mockJobMarket";

export interface FilterState {
  search: string;
  roleCategory: string;
  seniority: string;
  workMode: string;
  company: string;
  country: string;
  sortBy: "date" | "title" | "company";
  sortOrder: "asc" | "desc";
}

// Role category label mappings (same as InsightsDashboardPage)
const ROLE_CATEGORY_LABELS: Record<string, string> = {
  devopscloud: "DevOps & Cloud Engineer",
  devopsandcloud: "DevOps & Cloud Engineer",
  dataai: "AI/ML Engineer",
  dataandai: "AI/ML Engineer",
  aianddata: "AI/ML Engineer",
  othertech: "Other Tech Jobs",
  otherengineering: "Other Tech Jobs",
  programmanagement: "Project Manager",
  frontend: "Front-End Development",
  frontenddev: "Front-End Development",
  frontenddeveloper: "Front-End Development",
  frontendengineer: "Front-End Development",
  frontendengineering: "Front-End Development",
  frontendweb: "Front-End Development",
  webfrontend: "Front-End Development",
  uiengineer: "Front-End Development",
  uideveloper: "Front-End Development",
  backend: "Back-End Development",
  backenddev: "Back-End Development",
  backenddeveloper: "Back-End Development",
  backendengineer: "Back-End Development",
  backendengineering: "Back-End Development",
  serverside: "Back-End Development",
  fullstack: "Full-Stack Development",
  fullstackdev: "Full-Stack Development",
  fullstackdeveloper: "Full-Stack Development",
  fullstackengineer: "Full-Stack Development",
  fullstackengineering: "Full-Stack Development",
  webdeveloper: "Full-Stack Development",
  webdevelopment: "Full-Stack Development",
  softwareengineer: "Full-Stack Development",
  softwaredeveloper: "Full-Stack Development",
  softwareengineering: "Software Engineer",
  softwaredevelopment: "Full-Stack Development",
  generalengineer: "Full-Stack Development",
  general: "Full-Stack Development",
  devops: "DevOps & Cloud Engineer",
  devopsengineer: "DevOps & Cloud Engineer",
  devopsengineering: "DevOps & Cloud Engineer",
  cloud: "DevOps & Cloud",
  cloudengineer: "DevOps & Cloud",
  cloudarchitect: "DevOps & Cloud",
  cloudengineering: "DevOps & Cloud",
  sre: "DevOps & Cloud",
  sitereliability: "DevOps & Cloud",
  sitereliabilityengineer: "DevOps & Cloud",
  platformengineer: "DevOps & Cloud",
  infrastructure: "DevOps & Cloud",
};

const toReadableLabel = (value: string) => {
  if (!value) return "Unknown";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeCategoryKey = (raw: string): string =>
  raw.toLowerCase().replace(/[\s_\-\/]+/g, "");

const labelForCategory = (raw: string): string =>
  ROLE_CATEGORY_LABELS[normalizeCategoryKey(raw)] ?? toReadableLabel(raw);

interface JobFiltersProps {
  filters: FilterState;
  options: FilterOptions;
  onChange: (f: FilterState) => void;
  total: number;
}

const EMPTY: FilterState = {
  search: "",
  roleCategory: "",
  seniority: "",
  workMode: "",
  company: "",
  country: "",
  sortBy: "date",
  sortOrder: "desc",
};

const activeCount = (f: FilterState) =>
  [f.roleCategory, f.seniority, f.workMode, f.company, f.country].filter(Boolean).length;

const FilterControls = ({ filters, options, onChange }: Omit<JobFiltersProps, "total">) => {
  const set = (partial: Partial<FilterState>) => onChange({ ...filters, ...partial });

  return (
    <div className="space-y-5">
      {/* Selects */}
      {[
        { label: "Role Category", key: "roleCategory" as const, items: options.roleCategories },
        { label: "Seniority", key: "seniority" as const, items: options.seniorityLevels },
        { label: "Work Mode", key: "workMode" as const, items: options.workModes },
        { label: "Company", key: "company" as const, items: options.companies },
        { label: "Country", key: "country" as const, items: options.countries },
      ].map(({ label, key, items }) => (
        <div key={key} className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
          <Select value={filters[key] || "__all__"} onValueChange={(v) => set({ [key]: v === "__all__" ? "" : v })}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue>
                {filters[key] && key === "roleCategory" 
                  ? labelForCategory(filters[key]) 
                  : filters[key] || `All ${label}s`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All</SelectItem>
              {items.map((i) => (
                <SelectItem key={i} value={i}>
                  {key === "roleCategory" ? labelForCategory(i) : i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      {/* Sort */}
      <div className="space-y-1.5 pt-2 border-t border-border">
        <Label className="text-xs font-medium text-muted-foreground pt-3 block">Sort By</Label>
        <Select value={`${filters.sortBy}-${filters.sortOrder}`} onValueChange={(v) => {
          const [sortBy, sortOrder] = v.split("-") as ["date" | "title" | "company", "asc" | "desc"];
          set({ sortBy, sortOrder });
        }}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="title-asc">Title A–Z</SelectItem>
            <SelectItem value="company-asc">Company A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeCount(filters) > 0 && (
        <Button variant="ghost" size="sm" className="w-full text-xs mt-2" onClick={() => onChange({ ...EMPTY, search: filters.search })}>
          <X size={14} className="mr-1" /> Clear Filters
        </Button>
      )}
    </div>
  );
};

const JobFilters = ({ filters, options, onChange, total }: JobFiltersProps) => {
  const count = activeCount(filters);

  return (
    <>
      {/* Search bar (always visible) */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search jobs, companies, skills..."
            className="pl-9 h-10"
          />
        </div>

        {/* Mobile filter trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden h-10 w-10 relative">
              <SlidersHorizontal size={16} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterControls filters={filters} options={options} onChange={onChange} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filter chips */}
      {count > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {filters.roleCategory && (
            <Badge variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => onChange({ ...filters, roleCategory: "" })}>
              {labelForCategory(filters.roleCategory)} <X size={12} />
            </Badge>
          )}
          {filters.seniority && (
            <Badge variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => onChange({ ...filters, seniority: "" })}>
              {filters.seniority} <X size={12} />
            </Badge>
          )}
          {filters.workMode && (
            <Badge variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => onChange({ ...filters, workMode: "" })}>
              {filters.workMode} <X size={12} />
            </Badge>
          )}
          {filters.company && (
            <Badge variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => onChange({ ...filters, company: "" })}>
              {filters.company} <X size={12} />
            </Badge>
          )}
          {filters.country && (
            <Badge variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => onChange({ ...filters, country: "" })}>
              {filters.country} <X size={12} />
            </Badge>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">{total} job{total !== 1 ? "s" : ""} found</p>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <FilterControls filters={filters} options={options} onChange={onChange} />
      </div>
    </>
  );
};

export default JobFilters;
