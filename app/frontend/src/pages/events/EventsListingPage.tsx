import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, CalendarSearch } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import EventsHeroIllustration from "@/components/events/EventsHeroIllustration";
import EventsFilterBar, { type EventFilterState } from "@/components/events/EventsFilterBar";
import EventListCard from "@/components/events/EventListCard";
import PaginationBar from "@/components/projects/PaginationBar";
import { apiGet } from "@/lib/api";
import type { EventItem } from "@/data/eventsData";

type BackendEvent = {
  _id: string;
  title: string;
  type: string;
  coverImage?: string;
  dateTime: string;
  locationType: string;
  city?: string;
  tags?: string[];
  externalLink?: string;
  description?: string;
  featured?: boolean;
};

const PAGE_SIZE = 6;

const DEFAULT_FILTERS: EventFilterState = {
  type: "All",
  tags: [],
  location: "All",
  sortBy: "Soonest",
  dateRange: "All",
};

const mapEvent = (ev: BackendEvent): EventItem => {
  const start = ev.dateTime ? new Date(ev.dateTime) : new Date();
  const daysLeft = Math.max(0, Math.ceil((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  return {
    id: ev._id,
    title: ev.title,
    type: ev.type as EventItem["type"],
    coverImage: ev.coverImage || "",
    startDateTimeUTC: ev.dateTime,
    locationType: (ev.locationType as EventItem["locationType"]) || "Virtual",
    city: ev.city,
    tags: ev.tags || [],
    externalUrl: ev.externalLink || "#",
    description: ev.description || "",
    featured: Boolean(ev.featured),
    daysLeft,
  };
};

const EmptyState = ({ onClear }: { onClear: () => void }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
      <CalendarSearch size={28} className="text-primary" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-foreground">No events match your filters</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Try adjusting your filters to discover more events.
      </p>
    </div>
    <button
      onClick={onClear}
      className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
    >
      Reset Filters
    </button>
  </div>
);

const EventsListingPage = () => {
  const [filters, setFilters] = useState<EventFilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState<ReturnType<typeof mapEvent>[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return events.slice(start, start + PAGE_SIZE);
  }, [events, currentPage]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.type !== "All") params.set("type", filters.type);
        if (filters.location !== "All") params.set("location", filters.location);
        if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));
        if (filters.sortBy) params.set("sortBy", filters.sortBy);
        if (filters.dateRange && filters.dateRange !== "All") params.set("dateRange", filters.dateRange);

        const res = await apiGet<{ success: boolean; data: { events: BackendEvent[] } }>(`/events/public?${params.toString()}`);
        const mapped = (res?.data?.events ?? []).map(mapEvent);
        setEvents(mapped);
      } catch (err) {
        console.error("Failed to load events", err);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [filters]);

  const handleFilterChange = (f: EventFilterState) => { setFilters(f); setCurrentPage(1); };
  const handleClear = () => { setFilters(DEFAULT_FILTERS); setCurrentPage(1); };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <div className="border-b border-border bg-card/50 overflow-hidden">
          <Container className="py-4 lg:py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-10">
              <div className="flex-1 min-w-0 space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                    Explore <span className="gradient-text">Events</span>
                  </h1>
                  <p className="text-base text-muted-foreground max-w-lg leading-relaxed">
                    Discover hackathons, workshops, talks, and webinars to learn, build, and connect with the community.
                  </p>
                </div>
                <Link
                  to="/events/create"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Plus size={16} />
                  Create Event
                </Link>
              </div>
              <div className="hidden md:flex flex-shrink-0 items-center justify-center lg:w-[320px] xl:w-[380px]">
                <EventsHeroIllustration className="w-full" />
              </div>
            </div>
          </Container>
        </div>

        <Container className="py-6 space-y-6">
          {/* Filters */}
          <div className="rounded-xl border border-border bg-card p-4">
            <EventsFilterBar filters={filters} onChange={handleFilterChange} onClear={handleClear} />
          </div>

          {/* Count */}
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{events.length}</span> event{events.length !== 1 ? "s" : ""} found
          </p>

          {/* List */}
          {isLoading ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">Loading events...</div>
          ) : paginated.length === 0 ? (
            <EmptyState onClear={handleClear} />
          ) : (
            <div className="space-y-4">
              {paginated.map((ev) => (
                <EventListCard key={ev.id} event={ev} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {events.length > PAGE_SIZE && (
            <PaginationBar
              totalItems={events.length}
              pageSize={PAGE_SIZE}
              currentPage={currentPage}
              onPageChange={(page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            />
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default EventsListingPage;
