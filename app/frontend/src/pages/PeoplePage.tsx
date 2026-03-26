import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
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

const PAGE_SIZE = 9;

const DEFAULT_FILTERS: PeopleFilterState = {
  preferredRoles: [],
  skills: [],
  techStack: [],
  domainInterests: [],
};

const EmptyState = ({ onClear }: { onClear: () => void }) => (
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
      onClick={onClear}
      className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-brand-sm"
    >
      Clear Filters
    </button>
  </div>
);

const PeoplePage = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<PeopleFilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [people, setPeople] = useState<PeoplePerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoading(true);
        const res = await apiGet<{ success: boolean; data: { users: any[] } }>("/profile/members");
        const mapped = (res.data.users || []).map((u) => {
          const profile = u.profile || {};
          const name = profile.name || u.name || "Member";
          const avatar = profile.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}`;
          return {
            id: u.id,
            name,
            avatar,
            bio: profile.bio || "",
            preferredRoles: profile.preferredRoles || [],
            skills: profile.skills || [],
            techStack: profile.techStack || [],
            domainInterests: profile.domainInterests || [],
            stats: { projectsCount: 0, showcasesCount: 0 },
          } as PeoplePerson;
        });
        setPeople(mapped);
        setError(null);
      } catch (err: any) {
        setError(err?.message || "Failed to load members");
      } finally {
        setLoading(false);
      }
    };
    fetchPeople();
  }, []);

  const filtered = useMemo(() => {
    let result = [...people];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.bio.toLowerCase().includes(q) ||
          p.preferredRoles.some((r) => r.toLowerCase().includes(q)) ||
          p.skills.some((s) => s.toLowerCase().includes(q)) ||
          p.techStack.some((t) => t.toLowerCase().includes(q)) ||
          p.domainInterests.some((d) => d.toLowerCase().includes(q))
      );
    }

    if (filters.preferredRoles.length > 0)
      result = result.filter((p) => filters.preferredRoles.some((r) => p.preferredRoles.includes(r)));
    if (filters.skills.length > 0)
      result = result.filter((p) => filters.skills.some((s) => p.skills.includes(s)));
    if (filters.techStack.length > 0)
      result = result.filter((p) => filters.techStack.some((t) => p.techStack.includes(t)));
    if (filters.domainInterests.length > 0)
      result = result.filter((p) => filters.domainInterests.some((d) => p.domainInterests.includes(d)));

    return result;
  }, [search, filters, people]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
    setCurrentPage(1);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (f: PeopleFilterState) => {
    setFilters(f);
    setCurrentPage(1);
  };

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
                    Meet <span className="gradient-text">Builders</span>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Discover members by roles, skills, and what they build.
                  </p>
                </div>
                <PeopleSmartSearch value={search} onChange={handleSearch} />
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


          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? (
                "Loading members..."
              ) : error ? (
                <span className="text-destructive">{error}</span>
              ) : (
                <>
                  <span className="font-semibold text-foreground">{filtered.length}</span> member
                  {filtered.length !== 1 ? "s" : ""} found
                </>
              )}
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <div className="col-span-full py-12 text-center text-sm text-muted-foreground">Loading members...</div>
            ) : error ? (
              <div className="col-span-full py-12 text-center text-sm text-destructive">{error}</div>
            ) : paginated.length === 0 ? (
              <EmptyState onClear={handleClear} />
            ) : (
              paginated.map((person) => <PeopleCard key={person.id} person={person} />)
            )}
          </div>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <PaginationBar
              totalItems={filtered.length}
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

export default PeoplePage;
