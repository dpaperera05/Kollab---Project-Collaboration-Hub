import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Users, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import PeopleSmartSearch from "@/components/people/PeopleSmartSearch";
import PeopleFilters, { type PeopleFilterState } from "@/components/people/PeopleFilters";
import PeopleCard from "@/components/people/PeopleCard";
import PeopleHeroIllustration from "@/components/people/PeopleHeroIllustration";
import PaginationBar from "@/components/projects/PaginationBar";
import type { PeoplePerson } from "@/components/people/PeopleCard";
import { apiGet } from "@/lib/api";
import { getDefaultAvatarUrl } from "@/lib/defaultAvatar";

const PAGE_SIZE = 9;

// â”€â”€ URL helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function filtersFromParams(sp: URLSearchParams): PeopleFilterState {
  return {
    preferredRoles: sp.get("preferredRoles") ? sp.get("preferredRoles")!.split(",").filter(Boolean) : [],
    skills:         sp.get("skills")         ? sp.get("skills")!.split(",").filter(Boolean)         : [],
    techStack:      sp.get("techStack")      ? sp.get("techStack")!.split(",").filter(Boolean)      : [],
    domainInterests:sp.get("domainInterests")? sp.get("domainInterests")!.split(",").filter(Boolean): [],
  };
}

function buildFilterParams(f: PeopleFilterState, base: URLSearchParams): void {
  if (f.preferredRoles.length > 0) base.set("preferredRoles", f.preferredRoles.join(","));
  else base.delete("preferredRoles");
  if (f.skills.length > 0) base.set("skills", f.skills.join(","));
  else base.delete("skills");
  if (f.techStack.length > 0) base.set("techStack", f.techStack.join(","));
  else base.delete("techStack");
  if (f.domainInterests.length > 0) base.set("domainInterests", f.domainInterests.join(","));
  else base.delete("domainInterests");
}

// â”€â”€ Mapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function mapUserToPerson(u: any): PeoplePerson {
  const profile = u.profile || {};
  return {
    id: u.id,
    name: profile.name || u.name || "Member",
    avatar: profile.avatarUrl || getDefaultAvatarUrl(u.id || profile.name),
    bio: profile.bio || "",
    preferredRoles: profile.preferredRoles || [],
    skills: profile.skills || [],
    techStack: profile.techStack || [],
    domainInterests: profile.domainInterests || [],
    stats: u.stats || { projectsCount: 0, showcasesCount: 0 },
    smartScore: u.smartScore,
    searchReasons: u.searchReasons,
  };
}

// â”€â”€ API response types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface SmartSearchApiResponse {
  success: boolean;
  data: {
    mode: "smart-search" | "keyword-fallback";
    query: string;
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    users: any[];
    message?: string;
  };
}

// â”€â”€ Empty states â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const FilterEmptyState = ({ onClear }: { onClear: () => void }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-5">
    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
      <Users size={28} className="text-primary" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-foreground">No people match your filters</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Try adjusting your search or filters to find who you're looking for.
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
      <h3 className="text-xl font-bold text-foreground">No people found for this search</h3>
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

// â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PeoplePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // â”€â”€ Derive state from URL (source of truth) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const q           = searchParams.get("q") || "";
  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const sortBy      = searchParams.get("sortBy") || undefined;

  // â”€â”€ Local input state (decoupled; commits on Enter / Search click) â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [inputValue, setInputValue] = useState(q);

  // â”€â”€ Normal listing cache (fetch-all-once; filtered client-side) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [allPeople, setAllPeople]   = useState<PeoplePerson[]>([]);
  const allPeopleLoadedRef          = useRef(false);

  // â”€â”€ Smart search results (paginated from backend) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [smartPeople, setSmartPeople]         = useState<PeoplePerson[]>([]);
  const [smartTotal, setSmartTotal]           = useState(0);
  const [smartTotalPages, setSmartTotalPages] = useState(0);
  const [searchMode, setSearchMode]           = useState<"smart-search" | "keyword-fallback" | null>(null);

  // â”€â”€ Shared UI state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // â”€â”€ Sync inputValue when URL q changes (browser Back / Forward) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    setInputValue(q);
  }, [q]);

  // â”€â”€ Main data-fetch effect â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    let cancelled = false;

    if (q) {
      // â”€â”€ Smart search path â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const filters = filtersFromParams(searchParams);
      const params  = new URLSearchParams({
        q,
        page:     String(currentPage),
        pageSize: String(PAGE_SIZE),
      });
      if (filters.preferredRoles.length > 0)  params.set("preferredRoles",  filters.preferredRoles.join(","));
      if (filters.skills.length > 0)           params.set("skills",          filters.skills.join(","));
      if (filters.techStack.length > 0)        params.set("techStack",       filters.techStack.join(","));
      if (filters.domainInterests.length > 0)  params.set("domainInterests", filters.domainInterests.join(","));
      if (sortBy)                              params.set("sortBy",          sortBy);

      setLoading(true);
      apiGet<SmartSearchApiResponse>(`/profile/members/smart-search?${params.toString()}`)
        .then((res) => {
          if (cancelled) return;
          const mapped = (res.data.users || []).map(mapUserToPerson);
          setSmartPeople(mapped);
          setSmartTotal(res.data.total);
          setSmartTotalPages(res.data.totalPages);
          setSearchMode(res.data.mode);
          setError(null);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          const msg = err instanceof Error ? err.message : "Search failed";
          setError(msg);
          setSmartPeople([]);
          setSmartTotal(0);
          setSmartTotalPages(0);
        })
        .finally(() => { if (!cancelled) setLoading(false); });
    } else {
      // â”€â”€ Normal listing path â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      setSearchMode(null);
      setSmartPeople([]);

      if (allPeopleLoadedRef.current) {
        setLoading(false);
        return;
      }

      setLoading(true);
      apiGet<{ success: boolean; data: { users: any[] } }>("/profile/members")
        .then((res) => {
          if (cancelled) return;
          const mapped = (res.data.users || []).map(mapUserToPerson);
          setAllPeople(mapped);
          allPeopleLoadedRef.current = true;
          setError(null);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          const msg = err instanceof Error ? err.message : "Failed to load members";
          setError(msg);
          setAllPeople([]);
        })
        .finally(() => { if (!cancelled) setLoading(false); });
    }

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // â”€â”€ Client-side filter for normal listing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filteredPeople = useMemo(() => {
    if (q) return []; // smart search mode â€” not used
    const filters = filtersFromParams(searchParams);
    let result = [...allPeople];

    if (filters.preferredRoles.length > 0)
      result = result.filter((p) => filters.preferredRoles.some((r) => p.preferredRoles.includes(r)));
    if (filters.skills.length > 0)
      result = result.filter((p) => filters.skills.some((s) => p.skills.includes(s)));
    if (filters.techStack.length > 0)
      result = result.filter((p) => filters.techStack.some((t) => p.techStack.includes(t)));
    if (filters.domainInterests.length > 0)
      result = result.filter((p) => filters.domainInterests.some((d) => p.domainInterests.includes(d)));

    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPeople, searchParams.toString(), q]);

  // â”€â”€ Paginate normal listing client-side â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const paginatedNormal = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPeople.slice(start, start + PAGE_SIZE);
  }, [filteredPeople, currentPage]);

  // â”€â”€ Derived display values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const displayPeople  = q ? smartPeople          : paginatedNormal;
  const totalItems     = q ? smartTotal           : filteredPeople.length;
  const totalPages     = q ? smartTotalPages      : Math.ceil(filteredPeople.length / PAGE_SIZE);

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSearch = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val.trim()) next.set("q", val.trim());
      else next.delete("q");
      next.delete("page");
      return next;
    }, { replace: false });
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    // Clearing via X button should immediately remove q from URL
    if (!val) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("q");
        next.delete("page");
        return next;
      }, { replace: true });
    }
  };

  const handleFilterChange = (f: PeopleFilterState) => {
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

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filters = filtersFromParams(searchParams);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <div className="border-b border-border bg-card/50 overflow-hidden">
          <Container className="py-6 lg:py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8">
              <div className="flex-1 min-w-0 space-y-3.5">
                <div className="space-y-1">
                  <h1 className="text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                    Meet <span className="gradient-text">collaborators</span>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Discover members by roles, skills, and what they build.
                  </p>
                </div>
                <PeopleSmartSearch
                  value={inputValue}
                  onChange={handleInputChange}
                  onSearch={handleSearch}
                />
              </div>
              <div className="hidden md:flex flex-shrink-0 items-center justify-center lg:w-[380px] xl:w-[440px]">
                <PeopleHeroIllustration className="w-full" />
              </div>
            </div>
          </Container>
        </div>

        <Container className="py-8 space-y-8">
          {/* Filters */}
          <div className="rounded-xl border border-border bg-card p-4">
            <PeopleFilters filters={filters} onChange={handleFilterChange} onClear={handleClear} />
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
              {loading ? "Loading membersâ€¦" : error ? (
                <span className="text-destructive">{error}</span>
              ) : (
                <>
                  <span className="font-semibold text-foreground">{totalItems}</span>{" "}
                  member{totalItems !== 1 ? "s" : ""} found
                </>
              )}
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
                Loading membersâ€¦
              </div>
            ) : error ? (
              <div className="col-span-full py-12 text-center text-sm text-destructive">{error}</div>
            ) : displayPeople.length === 0 ? (
              q ? (
                <SmartEmptyState onClear={handleClear} />
              ) : (
                <FilterEmptyState onClear={handleClear} />
              )
            ) : (
              displayPeople.map((person) => <PeopleCard key={person.id} person={person} />)
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

export default PeoplePage;
