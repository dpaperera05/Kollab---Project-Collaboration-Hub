import { useState } from "react";
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
  isTechOnly: boolean;
  sortBy: "date" | "title" | "company";
  sortOrder: "asc" | "desc";
}

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
  isTechOnly: false,
  sortBy: "date",
  sortOrder: "desc",
};

const activeCount = (f: FilterState) =>
  [f.roleCategory, f.seniority, f.workMode, f.company, f.country].filter(Boolean).length + (f.isTechOnly ? 1 : 0);

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
          <Select value={filters[key]} onValueChange={(v) => set({ [key]: v === "__all__" ? "" : v })}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={`All ${label}s`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All</SelectItem>
              {items.map((i) => (
                <SelectItem key={i} value={i}>{i}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      {/* Tech toggle */}
      <div className="flex items-center justify-between pt-2">
        <Label className="text-sm font-medium">Tech Jobs Only</Label>
        <Switch checked={filters.isTechOnly} onCheckedChange={(v) => set({ isTechOnly: v })} />
      </div>

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
              {filters.roleCategory} <X size={12} />
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
          {filters.isTechOnly && (
            <Badge variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => onChange({ ...filters, isTechOnly: false })}>
              Tech Only <X size={12} />
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
