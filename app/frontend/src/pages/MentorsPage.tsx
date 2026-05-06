import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GraduationCap, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import MentorsHero from "@/components/mentors/MentorsHero";
import MentorFilters, { type MentorFilterState } from "@/components/mentors/MentorFilters";
import MentorCard from "@/components/mentors/MentorCard";
import PaginationBar from "@/components/projects/PaginationBar";
import type { Mentor } from "@/types/mentor";
import { apiGet } from "@/lib/api";
import type { KollabUser } from "@/lib/authStore";
import { mapUserToMentor } from "@/lib/mentorMapper";

const PAGE_SIZE = 9;

// ── URL helpers ───────────────────────────────────────────────────────────────

function filtersFromParams(sp: URLSearchParams): MentorFilterState {
  return {
    expertise: sp.get("expertise") ? sp.get("expertise")!.split(",").filter(Boolean) : [],
    domain: sp.get("domain") || "All",
    languages: sp.get("languages") ? sp.get("languages")!.split(",").filter(Boolean) : [],
    rate: sp.get("rate") || "All",
  };
}

function buildFilterParams(f: MentorFilterState, base: URLSearchParams): void {
  if (f.expertise.length > 0) base.set("expertise", f.expertise.join(","));
  else base.delete("expertise");
  if (f.domain && f.domain !== "All") base.set("domain", f.domain);
  else base.delete("domain");
  if (f.languages.length > 0) base.set("languages", f.languages.join(","));
  else base.delete("languages");
  if (f.rate && f.rate !== "All") base.set("rate", f.rate);
  else base.delete("rate");
}

// ── Types for API responses ───────────────────────────────────────────────────

interface SmartMentorUser extends KollabUser {
  smartScore?: number;
  searchReasons?: string[];
}

interface SmartSearchApiResponse {
  success: boolean;
  data: {
    mode: "smart-search" | "keyword-fallback";
    query: string;
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    users: SmartMentorUser[];
    message?: string;
  };
}

// ── Empty / no-results states ─────────────────────────────────────────────────

const FilterEmptyState = ({ onClear }: { onClear: () => void }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-5">
    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
      <GraduationCap size={28} className="text-primary" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-foreground">No mentors match your filters</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Try adjusting your search or filters to find the right mentor.
      </p>
    </div>
    <button
      type="button"
      onClick={onClear}
      className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-brand-sm"
    >
      Clear Filters
    </button>
  </div>
);

const SmartEmptyState = ({ onClear }: { onClear: () => void }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-5">
    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
      <Sparkles size={28} className="text-primary" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-foreground">No mentors found for this search</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Try different keywords or remove some filters.
      </p>
    </div>
    <button
      type="button"
      onClick={onClear}
      className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-brand-sm"
    >
      Clear Search
    </button>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const MentorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Derive state from URL (source of truth) ────────────────────────────────
  const q          = searchParams.get("q") || "";
  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const sortBy     = searchParams.get("sortBy") || undefined;

  // ── Local input state (decoupled from URL; only commits on Enter/Search) ───
  const [inputValue, setInputValue] = useState(q);

  // ── Normal listing cache (fetch-all-once; filtered client-side) ────────────
  const [allMentors, setAllMentors] = useState<Mentor[]>([]);
  const allMentorsLoadedRef = useRef(false);

  // ── Smart search results (paginated from backend) ─────────────────────────
  const [smartMentors, setSmartMentors]       = useState<Mentor[]>([]);
  const [smartTotal, setSmartTotal]           = useState(0);
  const [smartTotalPages, setSmartTotalPages] = useState(0);
  const [searchMode, setSearchMode]           = useState<"smart-search" | "keyword-fallback" | null>(null);

  // ── Shared UI state ────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // ── Sync inputValue when URL q changes (browser back / forward) ────────────
  useEffect(() => {
    setInputValue(q);
  }, [q]);

  // ── Main data-fetch effect ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    if (q) {
      // ── Smart search path ────────────────────────────────────────────────
      const filters = filtersFromParams(searchParams);
      const params  = new URLSearchParams({
        q,
        page:     String(currentPage),
        pageSize: String(PAGE_SIZE),
      });
      if (filters.expertise.length > 0) params.set("expertise", filters.expertise.join(","));
      if (filters.domain !== "All")      params.set("domain",    filters.domain);
      if (filters.languages.length > 0) params.set("languages", filters.languages.join(","));
      if (filters.rate !== "All")        params.set("rate",      filters.rate);
      if (sortBy)                        params.set("sortBy",    sortBy);

      setLoading(true);
      apiGet<SmartSearchApiResponse>(`/profile/mentors/smart-search?${params.toString()}`)
        .then((res) => {
          if (cancelled) return;
          const mapped = (res.data.users || []).map((u) => mapUserToMentor(u));
          setSmartMentors(mapped);
          setSmartTotal(res.data.total);
          setSmartTotalPages(res.data.totalPages);
          setSearchMode(res.data.mode);
          setError(null);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          const msg = err instanceof Error ? err.message : "Search failed";
          setError(msg);
          setSmartMentors([]);
          setSmartTotal(0);
          setSmartTotalPages(0);
        })
        .finally(() => { if (!cancelled) setLoading(false); });
    } else {
      // ── Normal listing path ──────────────────────────────────────────────
      setSearchMode(null);
      setSmartMentors([]);

      if (allMentorsLoadedRef.current) {
        // Already fetched — just clear loading; client-side filter handles the rest
        setLoading(false);
        return;
      }

      setLoading(true);
      apiGet<{ success: boolean; data: { users: KollabUser[] } }>("/profile/mentors")
        .then((res) => {
          if (cancelled) return;
          const mapped = (res.data.users || []).map((u) => mapUserToMentor(u));
          setAllMentors(mapped);
          allMentorsLoadedRef.current = true;
          setError(null);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          const msg = err instanceof Error ? err.message : "Failed to load mentors";
          setError(msg);
          setAllMentors([]);
        })
        .finally(() => { if (!cancelled) setLoading(false); });
    }

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // ── Client-side filter for normal listing ──────────────────────────────────
  const filteredMentors = useMemo(() => {
    if (q) return []; // smart search mode — not used
    const filters = filtersFromParams(searchParams);
    let result = [...allMentors];

    if (filters.expertise.length > 0)
      result = result.filter((m) => filters.expertise.some((e) => m.expertiseTags.includes(e)));
    if (filters.domain !== "All")
      result = result.filter((m) =>
        m.domainTags.some((d) => d.toLowerCase().includes(filters.domain.toLowerCase())),
      );
    if (filters.languages.length > 0)
      result = result.filter((m) => filters.languages.some((l) => m.languages.includes(l)));
    if (filters.rate === "Free")
      result = result.filter((m) => m.rate === "Free");
    if (filters.rate === "Paid")
      result = result.filter((m) => m.rate !== "Free");

    return result;
  // searchParams.toString() covers all filter changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMentors, searchParams.toString(), q]);

  // ── Paginate normal listing client-side ────────────────────────────────────
  const paginatedNormal = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMentors.slice(start, start + PAGE_SIZE);
  }, [filteredMentors, currentPage]);

  // ── Derived display values ─────────────────────────────────────────────────
  const displayMentors = q ? smartMentors     : paginatedNormal;
  const totalItems     = q ? smartTotal       : filteredMentors.length;
  const totalPages     = q ? smartTotalPages  : Math.ceil(filteredMentors.length / PAGE_SIZE);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val.trim()) {
        next.set("q", val.trim());
      } else {
        next.delete("q");
      }
      next.delete("page"); // reset to 1
      return next;
    }, { replace: false });
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    // If the user clears via the X button (val === ""), immediately update URL
    if (!val) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("q");
        next.delete("page");
        return next;
      }, { replace: true });
    }
  };

  const handleFilterChange = (f: MentorFilterState) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      buildFilterParams(f, next);
      next.delete("page");
      return next;
    }, { replace: true });
  };

  const handleClear = () => {
    setInputValue("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (page > 1) next.set("page", String(page));
      else next.delete("page");
      return next;
    }, { replace: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const filters = filtersFromParams(searchParams);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <MentorsHero
          search={inputValue}
          onSearchChange={handleInputChange}
          onSearch={handleSearch}
        />

        <Container className="py-8 space-y-8">
          {/* Filters */}
          <div className="rounded-xl border border-border bg-card p-4">
            <MentorFilters
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClear}
            />
          </div>

          {/* Smart search mode indicator */}
          {q && searchMode && !loading && (
            <div className="flex items-center gap-2">
              {searchMode === "smart-search" ? (
                <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
                  <Sparkles size={12} />
                  AI Smart Search results for: <span className="font-semibold">"{q}"</span>
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Search results for: <span className="font-medium text-foreground">"{q}"</span>
                </span>
              )}
            </div>
          )}

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading mentors…" : error ? (
                <span className="text-destructive">{error}</span>
              ) : (
                <>
                  <span className="font-semibold text-foreground">{totalItems}</span>{" "}
                  mentor{totalItems !== 1 ? "s" : ""} found
                </>
              )}
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
                Loading mentors…
              </div>
            ) : error ? (
              <div className="col-span-full py-12 text-center text-sm text-destructive">{error}</div>
            ) : displayMentors.length === 0 ? (
              q ? (
                <SmartEmptyState onClear={handleClear} />
              ) : (
                <FilterEmptyState onClear={handleClear} />
              )
            ) : (
              displayMentors.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <PaginationBar
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default MentorsPage;

