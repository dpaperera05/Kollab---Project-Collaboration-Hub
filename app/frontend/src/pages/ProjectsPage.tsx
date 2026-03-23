import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FolderOpen } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import SmartSearchBar from "@/components/projects/SmartSearchBar";
import ProjectFilters, { type FilterState } from "@/components/projects/ProjectFilters";
import ProjectCard, { type ProjectCardProject } from "@/components/projects/ProjectCard";
import RecommendedCarousel from "@/components/projects/RecommendedCarousel";
import PaginationBar from "@/components/projects/PaginationBar";
import ProjectsHeroIllustration from "@/components/projects/ProjectsHeroIllustration";
import { Skeleton } from "@/components/ui/skeleton";
import { mockProjects } from "@/data/mockProjects";
import { apiGet } from "@/lib/api";
import { getSession } from "@/lib/authStore";

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
  roles?: Array<{ title: string; status?: "Open" | "Filled"; seats?: number }>;
  ownerId?: string;
};

const recommendedProjects = mockProjects;

const PAGE_SIZE = 9;

const DEFAULT_FILTERS: FilterState = {
  domain: "All",
  technologies: [],
  roleType: "All",
  difficulty: "All",
  duration: "All",
  status: "All",
  sortBy: "Newest",
  tags: [],
};

const ProjectsSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    ))}
  </>
);

const EmptyState = ({ onClear }: { onClear: () => void }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-5">
    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
      <FolderOpen size={28} className="text-primary" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-foreground">No projects match your filters</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Try adjusting your search or filters to find what you're looking for.
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
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState<ProjectCardProject[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("q", search.trim());
        if (filters.domain !== "All") params.set("domain", filters.domain);
        if (filters.technologies.length > 0) params.set("technologies", filters.technologies.join(","));
        if (filters.roleType !== "All") params.set("roleType", filters.roleType);
        if (filters.difficulty !== "All") params.set("difficulty", filters.difficulty);
        if (filters.duration !== "All") params.set("duration", filters.duration);
        if (filters.status !== "All") params.set("status", filters.status);
        if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));
        if (filters.sortBy) params.set("sortBy", filters.sortBy);
        params.set("page", String(currentPage));
        params.set("pageSize", String(PAGE_SIZE));

        const res = await apiGet<{ success: boolean; data: { projects: BackendProject[]; total: number; page: number; pageSize: number } }>(
          `/projects/public?${params.toString()}`,
        );

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
          posterName: p.ownerId ? "Project owner" : undefined,
          roles: (p.roles ?? []).map((role) => ({
            title: role.title,
            status: role.status,
            total: role.seats,
            filled: role.status === "Filled" ? role.seats : 0,
          })),
        }));
        setProjects(mapped);
        setTotalCount(res?.data?.total ?? mapped.length);
        setCurrentPage(res?.data?.page ?? currentPage);
      } catch (err) {
        console.error("Failed to load projects", err);
        setProjects([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [search, filters, currentPage]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
    setCurrentPage(1);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleAddProject = () => {
    const session = getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    navigate("/projects/new");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Page header — two-column on desktop */}
        <div className="border-b border-border bg-card/50 overflow-hidden">
          <Container className="py-6 lg:py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8">
              {/* Left: title + subtitle + search + CTA */}
              <div className="flex-1 min-w-0 space-y-3.5">
                <div className="space-y-1">
                  <h1 className="text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                    Browse <span className="gradient-text">Projects</span>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Discover real projects, teams, and roles. Find your next collaboration.
                  </p>
                </div>

                <SmartSearchBar value={search} onChange={handleSearch} />

                <button
                  onClick={handleAddProject}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 shadow-brand-sm hover:shadow-brand"
                >
                  <Plus size={16} />
                  Add New Project
                </button>
              </div>

              {/* Right: illustration — hidden on mobile, visible md+ */}
              <div className="hidden md:flex flex-shrink-0 items-center justify-center lg:w-[400px] xl:w-[460px]">
                <ProjectsHeroIllustration className="w-full" />
              </div>
            </div>
          </Container>
        </div>

        <Container className="py-8 space-y-8">
          {/* Filters */}
          <div className="rounded-xl border border-border bg-card p-4">
            <ProjectFilters filters={filters} onChange={handleFilterChange} onClear={handleClear} />
          </div>

          {/* AI Recommended Carousel */}
          <div className="rounded-xl border border-border bg-card/50 p-5">
            <RecommendedCarousel projects={recommendedProjects} />
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{totalCount}</span> project
              {totalCount !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoading ? (
              <ProjectsSkeleton />
            ) : projects.length === 0 ? (
              <EmptyState onClear={handleClear} />
            ) : (
              projects.map((project) => <ProjectCard key={project.id} project={project} />)
            )}
          </div>

          {/* Pagination */}
          {!isLoading && totalCount > 0 && (
            <PaginationBar
              totalItems={totalCount}
              pageSize={PAGE_SIZE}
              currentPage={currentPage}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectsPage;
