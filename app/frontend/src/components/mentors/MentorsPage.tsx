import { useState, useMemo } from "react";
import { GraduationCap } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import MentorsHero from "@/components/mentors/MentorsHero";
import MentorFilters, { MentorFilterState } from "@/components/mentors/MentorFilters";
import MentorCard from "@/components/mentors/MentorCard";
import RecommendedMentorsCarousel from "@/components/mentors/RecommendedMentorsCarousel";
import BookSessionModal from "@/components/mentors/BookSessionModal";
import PaginationBar from "@/components/projects/PaginationBar";
import { mockMentors, Mentor } from "@/data/mockMentors";

const PAGE_SIZE = 9;

const DEFAULT_FILTERS: MentorFilterState = {
  expertise: [],
  domain: "All",
  languages: [],
  rate: "All",
};

const EmptyState = ({ onClear }: { onClear: () => void }) => (
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
      onClick={onClear}
      className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-brand-sm"
    >
      Clear Filters
    </button>
  </div>
);

const MentorsPage = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<MentorFilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [quickBookMentor, setQuickBookMentor] = useState<Mentor | null>(null);

  const filtered = useMemo(() => {
    let result = [...mockMentors];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.headline.toLowerCase().includes(q) ||
          m.bio.toLowerCase().includes(q) ||
          m.expertiseTags.some((t) => t.toLowerCase().includes(q)) ||
          m.domainTags.some((t) => t.toLowerCase().includes(q)) ||
          m.languages.some((l) => l.toLowerCase().includes(q))
      );
    }

    if (filters.expertise.length > 0)
      result = result.filter((m) => filters.expertise.some((e) => m.expertiseTags.includes(e)));
    if (filters.domain !== "All")
      result = result.filter((m) => m.domainTags.some((d) => d.toLowerCase().includes(filters.domain.toLowerCase())));
    if (filters.languages.length > 0)
      result = result.filter((m) => filters.languages.some((l) => m.languages.includes(l)));
    if (filters.rate === "Free")
      result = result.filter((m) => m.rate === "Free");
    if (filters.rate === "Paid")
      result = result.filter((m) => m.rate !== "Free");

    return result;
  }, [search, filters]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <MentorsHero search={search} onSearchChange={(val) => { setSearch(val); setCurrentPage(1); }} />

        <Container className="py-8 space-y-8">
          {/* Recommended carousel */}
          <RecommendedMentorsCarousel onBook={(m) => setQuickBookMentor(m)} />

          {/* Filters */}
          <div className="rounded-xl border border-border bg-card p-4">
            <MentorFilters filters={filters} onChange={(f) => { setFilters(f); setCurrentPage(1); }} onClear={handleClear} />
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> mentor{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.length === 0 ? (
              <EmptyState onClear={handleClear} />
            ) : (
              paginated.map((mentor, idx) => (
                <MentorCard key={mentor.id} mentor={mentor} index={idx + (currentPage - 1) * PAGE_SIZE} />
              ))
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

      {/* Quick book modal from carousel */}
      {quickBookMentor && (
        <BookSessionModal
          mentor={quickBookMentor}
          open={!!quickBookMentor}
          onOpenChange={(open) => { if (!open) setQuickBookMentor(null); }}
        />
      )}
    </div>
  );
};

export default MentorsPage;
