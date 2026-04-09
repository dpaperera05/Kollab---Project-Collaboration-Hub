import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Inbox } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import JobCard from "@/components/insights/JobCard";
import JobFilters, { type FilterState } from "@/components/insights/JobFilters";
import { fetchJobs, fetchFilters, type FetchJobsResult } from "@/services/jobMarketApi";
import type { JobFilters as FilterOptions } from "@/data/mockJobMarket";

const INITIAL_FILTERS: FilterState = {
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

const JobExplorerPage = () => {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [filterOpts, setFilterOpts] = useState<FilterOptions | null>(null);
  const [result, setResult] = useState<FetchJobsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchFilters().then(setFilterOpts);
  }, []);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    const r = await fetchJobs({
      page,
      limit: 9,
      search: filters.search || undefined,
      roleCategory: filters.roleCategory || undefined,
      seniority: filters.seniority || undefined,
      workMode: filters.workMode || undefined,
      isTechJob: filters.isTechOnly ? true : undefined,
      company: filters.company || undefined,
      country: filters.country || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
    setResult(r);
    setLoading(false);
  }, [filters, page]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleFilterChange = (f: FilterState) => {
    setFilters(f);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-6 border-b border-border bg-gradient-to-b from-primary/[0.02] to-transparent">
        <Container>
          <div className="flex items-center gap-3 mb-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link to="/insights"><ArrowLeft size={16} /></Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Job Explorer</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-lg">Browse, filter, and discover jobs across the tech industry.</p>
        </Container>
      </div>

      <div className="py-8">
        <Container>
          <div className="flex gap-8">
            {/* Desktop sidebar */}
            {filterOpts && (
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <JobFilters filters={filters} options={filterOpts} onChange={handleFilterChange} total={result?.total ?? 0} />
                </div>
              </aside>
            )}

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Mobile search + filter bar */}
              {filterOpts && (
                <div className="lg:hidden">
                  <JobFilters filters={filters} options={filterOpts} onChange={handleFilterChange} total={result?.total ?? 0} />
                </div>
              )}

              {/* Desktop search */}
              <div className="hidden lg:block">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">{result?.total ?? 0} job{(result?.total ?? 0) !== 1 ? "s" : ""} found</p>
                </div>
              </div>

              {loading ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-56 rounded-xl" />
                  ))}
                </div>
              ) : result && result.jobs.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {result.jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {result.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                        Previous
                      </Button>
                      {Array.from({ length: result.totalPages }).map((_, i) => (
                        <Button
                          key={i}
                          variant={page === i + 1 ? "default" : "outline"}
                          size="sm"
                          className="w-9"
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      <Button variant="outline" size="sm" disabled={page >= result.totalPages} onClick={() => setPage(page + 1)}>
                        Next
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Inbox size={48} className="text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-1">No jobs found</h3>
                  <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search terms.</p>
                  <Button variant="outline" size="sm" onClick={() => handleFilterChange(INITIAL_FILTERS)}>Clear All Filters</Button>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Footer />
    </div>
  );
};

export default JobExplorerPage;
