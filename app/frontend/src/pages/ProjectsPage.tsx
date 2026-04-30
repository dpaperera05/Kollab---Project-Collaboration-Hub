import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FolderOpen, Plus, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import SmartSearchBar from "@/components/projects/SmartSearchBar";
import ProjectFilters, { type FilterState } from "@/components/projects/ProjectFilters";
import ProjectCard, { type ProjectCardProject } from "@/components/projects/ProjectCard";
import RecommendedCarousel from "@/components/projects/RecommendedCarousel";
import PaginationBar from "@/components/projects/PaginationBar";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { getSession } from "@/lib/authStore";
import type { RecommendationProject } from "@/components/projects/RecommendedCarousel";

type BackendProject = {
  _id: string;
  title: string;
  summary: string;
  domain: string;
  difficulty: string;
  status: "Open" | "Ongoing" | "Filled" | "Finished";
  technologies?: string[];
  tags?: string[];
  postedAt?: string;
  createdAt?: string;
  compensation?: string;
  weeklyHours?: number;
  duration?: string;
  posterImage?: string;
  roles?: Array<{ title: string; status?: "Open" | "Filled"; seats?: number }>;
  ownerId?: string;
  owner?: { id?: string; name?: string; avatar?: string; rating?: number };
};

/** Shape returned by GET /api/projects/public/smart-search
 * Both `_id` and `id` are string IDs (smart search always returns both).
 * `roles` is already pre-mapped (total/filled) by the service â€” no seats field.
 */
type SmartSearchProject = Omit<BackendProject, "roles"> & {
  id: string;
  roles?: Array<{
    title: string;
    status?: "Open" | "Filled";
    /** Already mapped from seats by the service */
    total?: number;
    filled?: number;
  }>;
  posterName?: string;
  posterAvatar?: string;
  smartScore?: number;
  searchReasons?: string[];
};

type SmartSearchApiResponse = {
  success: boolean;
  data: {
    mode: "smart-search" | "keyword-fallback";
    query: string;
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    projects: SmartSearchProject[];
  };
};

const PAGE_SIZE = 9;

type RecommendationApiResponse = {
  success: boolean;
  data: {
    mode: "personalized" | "latest";
    title: string;
    subtitle: string;
    projects: RecommendationProject[];
  };
};

const ProjectsSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
        <Skeleton className="w-full h-28" />
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>
          <Skeleton className="h-8 w-full rounded-lg mt-1" />
        </div>
      </div>
    ))}
  </>
);

const ProjectsHero = ({
  inputValue,
  onInputChange,
  onSearch,
  onPostProject,
}: {
  inputValue: string;
  onInputChange: (v: string) => void;
  onSearch: (v: string) => void;
  onPostProject: () => void;
}) => (
  <section className="relative border-b border-border bg-card overflow-hidden">
    {/* ── Decorative background layer ──────────────────────────────── */}
    <div className="absolute inset-0 pointer-events-none select-none z-0" aria-hidden="true">
      {/* Soft central violet glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[320px] rounded-full bg-violet-500/10 blur-[90px]" />
      {/* Faint dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "radial-gradient(circle, #7c3aed 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      {/* Left: large blurred orb */}
      <div className="hidden md:block absolute -left-10 top-1/2 -translate-y-1/2 w-52 h-52 rounded-full bg-gradient-to-br from-violet-400/25 to-purple-600/10 blur-3xl" />
      {/* Left: small accent orb */}
      <div className="hidden md:block absolute left-[9%] top-[18%] w-10 h-10 rounded-full bg-violet-300/30 blur-lg" />
      {/* Left: rotating geometric cube */}
      <div className="hidden md:block absolute left-[11%] top-[28%] w-8 h-8 rounded-xl border border-violet-300/50 dark:border-violet-500/20 bg-gradient-to-br from-violet-100/80 to-violet-200/30 dark:from-violet-900/20 dark:to-transparent rotate-[18deg] shadow-sm" />
      {/* Left: glass code bracket card */}
      <div className="hidden lg:block absolute left-[4%] top-[30%] w-32 rounded-2xl border border-violet-200/60 dark:border-violet-500/20 bg-white/75 dark:bg-white/5 backdrop-blur-sm shadow-[0_2px_12px_rgba(124,58,237,0.08)] p-3.5">
        <div className="font-mono text-[11px] leading-relaxed">
          <span className="text-violet-500">{"<"}</span>
          <span className="text-pink-500 font-semibold">Project</span>
          <span className="text-violet-400">{" />"}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-muted-foreground">Kollab</span>
        </div>
      </div>
      {/* Left: tiny dot */}
      <div className="hidden md:block absolute left-[6%] bottom-[28%] w-3 h-3 rounded-full bg-violet-400/40" />
      {/* Left: small square accent */}
      <div className="hidden md:block absolute left-[15%] bottom-[22%] w-4 h-4 rounded-md border border-pink-300/40 dark:border-pink-500/20 bg-pink-100/60 dark:bg-transparent rotate-[-10deg]" />

      {/* Right: large blurred orb */}
      <div className="hidden md:block absolute -right-10 top-1/2 -translate-y-1/2 w-52 h-52 rounded-full bg-gradient-to-bl from-fuchsia-400/20 to-violet-500/10 blur-3xl" />
      {/* Right: accent orb */}
      <div className="hidden md:block absolute right-[8%] top-[20%] w-9 h-9 rounded-full bg-pink-300/30 blur-lg" />
      {/* Right: glass checkmark card */}
      <div className="hidden lg:block absolute right-[4%] top-[26%] w-36 rounded-2xl border border-emerald-200/60 dark:border-emerald-500/20 bg-white/75 dark:bg-white/5 backdrop-blur-sm shadow-[0_2px_12px_rgba(16,185,129,0.07)] p-3.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2 5.2L4 7L8 3" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-foreground">Team match</span>
        </div>
        <div className="mt-1.5 text-[10px] text-muted-foreground">3 roles open</div>
      </div>
      {/* Right: dark mini code panel */}
      <div className="hidden lg:block absolute right-[3%] bottom-[16%] w-36 rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-[0_4px_20px_rgba(0,0,0,0.25)] p-3">
        <div className="font-mono text-[9px] leading-[1.8]">
          <div>
            <span className="text-blue-400">const </span>
            <span className="text-white">idea</span>
            <span className="text-zinc-500"> = </span>
            <span className="text-amber-300">"yours"</span>
          </div>
          <div>
            <span className="text-blue-400">const </span>
            <span className="text-white">team</span>
            <span className="text-zinc-500"> = </span>
            <span className="text-emerald-400">kollab()</span>
          </div>
          <div>
            <span className="text-pink-400">launch</span>
            <span className="text-zinc-500">(idea, team)</span>
          </div>
        </div>
      </div>
      {/* Right: small rotating cube */}
      <div className="hidden md:block absolute right-[12%] top-[24%] w-7 h-7 rounded-lg border border-pink-300/40 dark:border-pink-500/20 bg-gradient-to-br from-pink-100/60 to-violet-100/40 dark:from-transparent dark:to-transparent rotate-[-14deg] shadow-sm" />
      {/* Right: tiny dot */}
      <div className="hidden md:block absolute right-[17%] bottom-[26%] w-3 h-3 rounded-full bg-fuchsia-400/40" />
    </div>

    {/* ── Hero content ─────────────────────────────────────────────── */}
    <Container className="relative z-10 py-12 lg:py-16 xl:py-20">
      <div className="flex flex-col items-center text-center gap-6 mx-auto max-w-[42rem]">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
          <span className="text-foreground">Turn your idea into a </span>
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
            startup
          </span>
        </h1>

        <div className="w-full">
          <SmartSearchBar
            value={inputValue}
            onChange={onInputChange}
            onSearch={onSearch}
            placeholder="Search by idea, skill, tech stack, or role..."
            large
          />
        </div>

        <button
          onClick={onPostProject}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-[0_4px_18px_rgba(124,58,237,0.35)] hover:shadow-[0_6px_26px_rgba(124,58,237,0.45)] hover:from-violet-500 hover:to-purple-500 transition-all duration-200"
        >
          <Plus size={15} />
          Post a project
        </button>
      </div>
    </Container>
  </section>
);

const EmptyState = ({ onClear, isSearch }: { onClear: () => void; isSearch?: boolean }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-5">
    <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10">
      <FolderOpen size={28} className="text-primary" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-foreground">
        {isSearch ? "No projects found for this search" : "No projects match your filters"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {isSearch
          ? "Try different keywords or remove some filters."
          : "Try adjusting your search or filters to find what you're looking for."}
      </p>
    </div>
    <button
      onClick={onClear}
      className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-brand-sm"
    >
      Clear Filters
    </button>
  </div>
);

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // â”€â”€ State derived from URL (source of truth) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const search      = searchParams.get("q") ?? "";
  const currentPage = Math.max(parseInt(searchParams.get("page") ?? "1", 10) || 1, 1);
  const filters: FilterState = {
    domain:       searchParams.get("domain")       ?? "All",
    technologies: searchParams.get("technologies") ? searchParams.get("technologies")!.split(",").filter(Boolean) : [],
    roleType:     searchParams.get("roleType")     ?? "All",
    difficulty:   searchParams.get("difficulty")   ?? "All",
    duration:     searchParams.get("duration")     ?? "All",
    status:       searchParams.get("status")       ?? "All",
    sortBy:       searchParams.get("sortBy")       ?? "Newest",
    tags:         searchParams.get("tags")         ? searchParams.get("tags")!.split(",").filter(Boolean) : [],
  };

  // â”€â”€ Local component state (not URL-driven) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /**
   * inputValue is what the search bar displays.
   * It is updated on every keystroke but does NOT immediately update the URL
   * (to avoid polluting browser history on every character typed).
   * The URL is only updated on Enter / Search button (handleSearch).
   * Browser back/forward syncs inputValue from the URL via useEffect.
   */
  const [inputValue, setInputValue]           = useState(() => searchParams.get("q") ?? "");
  const [projects, setProjects]               = useState<ProjectCardProject[]>([]);
  const [totalCount, setTotalCount]           = useState(0);
  const [isLoading, setIsLoading]             = useState(true);
  const [bookmarkedIds, setBookmarkedIds]     = useState<string[]>([]);
  const [smartSearchMode, setSmartSearchMode] = useState<"smart-search" | "keyword-fallback" | null>(null);
  const [recData, setRecData]                 = useState<RecommendationApiResponse["data"]>({
    mode: "latest",
    title: "Latest Projects",
    subtitle: "Browse the most recently posted open projects",
    projects: [],
  });
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);

  // â”€â”€ Sync input display value when URL changes (browser back/forward) â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    setInputValue(searchParams.get("q") ?? "");
    // Only react to `q` changes, not every filter update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")]);

  // â”€â”€ Recommendation carousel (independent of search state) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoadingRecs(true);
      try {
        const res = await apiGet<RecommendationApiResponse>("/recommendations/projects");
        if (res?.data) setRecData(res.data);
      } catch (err) {
        console.error("Failed to load recommendations", err);
      } finally {
        setIsLoadingRecs(false);
      }
    };
    loadRecommendations();
  }, []);

  // â”€â”€ Bookmarks (independent of search state) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const loadBookmarks = async () => {
      const session = getSession();
      if (!session) { setBookmarkedIds([]); return; }
      try {
        const res = await apiGet<{ success: boolean; data?: { projects?: BackendProject[] } }>("/bookmarks");
        setBookmarkedIds((res?.data?.projects ?? []).map((p) => p._id));
      } catch (err) {
        console.error("Failed to load bookmarks", err);
        setBookmarkedIds([]);
      }
    };
    loadBookmarks();
  }, []);

  // â”€â”€ Project fetch â€” re-runs whenever the URL (searchParams) changes â”€â”€â”€â”€â”€â”€â”€
  // -- Project fetch -- re-runs whenever the URL (searchParams) changes -------
  useEffect(() => {
    // Cancellation flag: if the URL changes before this fetch completes
    // (React Strict Mode double-invoke, concurrent re-render, rapid navigation),
    // the stale response is discarded so it cannot overwrite fresher results.
    let cancelled = false;

    const loadProjects = async () => {
      // Read ALL needed values directly from searchParams inside the effect.
      // This is belt-and-suspenders: avoids any closure-staleness concern.
      const q          = searchParams.get("q") ?? "";
      const trimmedQ   = q.trim();
      const page       = Math.max(parseInt(searchParams.get("page") ?? "1", 10) || 1, 1);
      const domain     = searchParams.get("domain")       ?? "All";
      const techs      = searchParams.get("technologies") ?? "";
      const roleType   = searchParams.get("roleType")     ?? "All";
      const difficulty = searchParams.get("difficulty")   ?? "All";
      const duration   = searchParams.get("duration")     ?? "All";
      const status     = searchParams.get("status")       ?? "All";
      const sortBy     = searchParams.get("sortBy")       ?? "Newest";
      const tags       = searchParams.get("tags")         ?? "";

      // -- DEBUG (remove after confirming browser-Back works) ----------------
      console.log("ProjectsPage URL q:", q);

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (domain     !== "All") params.set("domain",       domain);
        if (techs)                params.set("technologies", techs);
        if (roleType   !== "All") params.set("roleType",     roleType);
        if (difficulty !== "All") params.set("difficulty",   difficulty);
        if (duration   !== "All") params.set("duration",     duration);
        if (status     !== "All") params.set("status",       status);
        if (tags)                 params.set("tags",         tags);
        params.set("page",     String(page));
        params.set("pageSize", String(PAGE_SIZE));

        if (trimmedQ) {
          // -- Smart Search path ---------------------------------------------
          params.set("q", trimmedQ);
          params.set("sortBy", sortBy === "Newest" ? "Most Relevant" : sortBy);

          const endpoint = `/projects/public/smart-search?${params.toString()}`;
          // -- DEBUG --------------------------------------------------------
          console.log("Fetching endpoint:", endpoint);
          console.log("Fetching params:", params.toString());

          const res = await apiGet<SmartSearchApiResponse>(endpoint);
          if (cancelled) return;

          setSmartSearchMode(res?.data?.mode ?? "smart-search");
          const mapped = (res?.data?.projects ?? []).map((p) => ({
            id: p._id,
            title: p.title,
            summary: p.summary,
            domain: p.domain,
            difficulty: p.difficulty,
            status: p.status,
            technologies: p.technologies ?? [],
            tags: p.tags ?? [],
            postedAt: p.postedAt ?? p.createdAt ?? new Date().toISOString(),
            compensation: p.compensation,
            weeklyHours: p.weeklyHours,
            duration: p.duration,
            posterImage: p.posterImage,
            posterName: p.posterName ?? p.owner?.name ?? "Project owner",
            posterAvatar: p.posterAvatar ?? p.owner?.avatar,
            roles: (p.roles ?? []).map((role) => ({
              title: role.title,
              status: role.status,
              total: role.total,
              filled: role.filled ?? 0,
            })),
            smartScore: p.smartScore,
            searchReasons: p.searchReasons,
          }));
          setProjects(mapped);
          setTotalCount(res?.data?.total ?? mapped.length);
        } else {
          // -- Normal listing path -------------------------------------------
          if (sortBy) params.set("sortBy", sortBy);

          const endpoint = `/projects/public?${params.toString()}`;
          // -- DEBUG --------------------------------------------------------
          console.log("Fetching endpoint:", endpoint);
          console.log("Fetching params:", params.toString());

          const res = await apiGet<{ success: boolean; data: { projects: BackendProject[]; total: number; page: number; pageSize: number } }>(
            endpoint,
          );
          if (cancelled) return;

          setSmartSearchMode(null);
          const mapped = (res?.data?.projects ?? []).map((p) => ({
            id: p._id,
            title: p.title,
            summary: p.summary,
            domain: p.domain,
            difficulty: p.difficulty,
            status: p.status,
            technologies: p.technologies ?? [],
            tags: p.tags ?? [],
            postedAt: p.postedAt ?? p.createdAt ?? new Date().toISOString(),
            compensation: p.compensation,
            weeklyHours: p.weeklyHours,
            duration: p.duration,
            posterImage: p.posterImage,
            posterName: p.owner?.name || "Project owner",
            posterAvatar: p.owner?.avatar,
            roles: (p.roles ?? []).map((role) => ({
              title: role.title,
              status: role.status,
              total: role.seats,
              filled: role.status === "Filled" ? role.seats : 0,
            })),
          }));
          setProjects(mapped);
          setTotalCount(res?.data?.total ?? mapped.length);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load projects", err);
        setProjects([]);
        setTotalCount(0);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadProjects();
    // Cleanup: mark this invocation stale so in-flight results are discarded
    return () => { cancelled = true; };
    // Depends on the serialised URL string -- stable, changes only when URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // â”€â”€ URL update helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /** Write filter values into a URLSearchParams, removing defaults to keep the URL clean. */
  const applyFiltersToParams = (f: FilterState, next: URLSearchParams) => {
    if (f.domain !== "All")          next.set("domain",       f.domain);       else next.delete("domain");
    if (f.technologies.length > 0)   next.set("technologies", f.technologies.join(",")); else next.delete("technologies");
    if (f.roleType !== "All")        next.set("roleType",     f.roleType);     else next.delete("roleType");
    if (f.difficulty !== "All")      next.set("difficulty",   f.difficulty);   else next.delete("difficulty");
    if (f.duration !== "All")        next.set("duration",     f.duration);     else next.delete("duration");
    if (f.status !== "All")          next.set("status",       f.status);       else next.delete("status");
    if (f.sortBy && f.sortBy !== "Newest") next.set("sortBy", f.sortBy);       else next.delete("sortBy");
    if (f.tags.length > 0)           next.set("tags",         f.tags.join(",")); else next.delete("tags");
  };

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /** Fires on every keystroke â€” only updates the input display, NOT the URL. */
  const handleInputChange = (val: string) => {
    setInputValue(val);
    // X button clears the input. Use replace:true so clearing does NOT push a new
    // /projects history entry that would absorb a Back press before the search URL.
    if (!val) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("q");
          next.delete("page");
          return next;
        },
        { replace: true },
      );
    }
  };
  /** Fires on Enter / Search button â€” commits the query to the URL and triggers fetch. */
  const handleSearch = (val: string) => {
    const trimmed = val.trim();
    setInputValue(val);
    // replace:false (explicit push) ensures this URL is saved in browser history
    // so pressing Back from the detail page returns here with search results.
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (trimmed) next.set("q", trimmed); else next.delete("q");
        next.delete("page"); // reset to page 1
        return next;
      },
      { replace: false },
    );
  };
  const handleFilterChange = (newFilters: FilterState) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      applyFiltersToParams(newFilters, next);
      next.delete("page"); // reset to page 1 on filter change
      return next;
    }, { replace: true }); // replace = no extra history entry per filter toggle
  };

  const handleClear = () => {
    setInputValue("");
    setSmartSearchMode(null);
    setSearchParams({});
  };

  const handleAddProject = () => {
    const session = getSession();
    if (!session) {
      navigate("/login", { state: { from: "/projects/new" } });
      return;
    }
    navigate("/projects/new");
  };

  const handleToggleBookmark = async (projectId: string) => {
    const session = getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    const isBookmarked = bookmarkedIds.includes(projectId);
    setBookmarkedIds((prev) => (isBookmarked ? prev.filter((id) => id !== projectId) : [...prev, projectId]));

    try {
      if (isBookmarked) {
        await apiDelete(`/bookmarks/${projectId}`);
      } else {
        await apiPost(`/bookmarks/${projectId}`, {});
      }
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
      setBookmarkedIds((prev) => (isBookmarked ? [...prev, projectId] : prev.filter((id) => id !== projectId)));
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
                {/* Hero — two-column on desktop */}
        
        <ProjectsHero
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onSearch={handleSearch}
          onPostProject={handleAddProject}
        />
        <div id="recommended">
        <Container className="py-8 space-y-6">
          {/* AI Recommended Carousel */}
          <div className="rounded-xl border border-border bg-card/50 p-5">
            <RecommendedCarousel
              projects={recData.projects}
              title={recData.title}
              subtitle={recData.subtitle}
              mode={recData.mode}
              loading={isLoadingRecs}
            />
          </div>

          {/* Filters */}
          <div className="rounded-xl border border-border bg-card p-3.5">
            <ProjectFilters filters={filters} onChange={handleFilterChange} onClear={handleClear} />
          </div>

          {/* Results count + search mode indicator */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {search.trim() && smartSearchMode ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  <Sparkles size={14} />
                  {smartSearchMode === "smart-search" ? "AI Smart Search results for:" : "Search results for:"}
                </span>
                <span className="text-sm text-foreground font-semibold">&ldquo;{search}&rdquo;</span>
                <span className="text-xs text-muted-foreground">
                  ({totalCount} project{totalCount !== 1 ? "s" : ""})
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{totalCount}</span> project
                {totalCount !== 1 ? "s" : ""} found
              </p>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <ProjectsSkeleton />
            ) : projects.length === 0 ? (
              <EmptyState onClear={handleClear} isSearch={!!search.trim()} />
            ) : (
              projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  bookmarked={bookmarkedIds.includes(project.id)}
                  onToggleBookmark={() => handleToggleBookmark(project.id)}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {!isLoading && totalCount > 0 && (
            <PaginationBar
              totalItems={totalCount}
              pageSize={PAGE_SIZE}
              currentPage={currentPage}
              onPageChange={(page) => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  if (page === 1) next.delete("page"); else next.set("page", String(page));
                  return next;
                });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
        </Container>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectsPage;