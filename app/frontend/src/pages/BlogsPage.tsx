import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PenLine, BookOpen } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import BlogsHeroIllustration from "@/components/blogs/BlogsHeroIllustration";
import BlogFilterBar, { type BlogFilterState } from "@/components/blogs/BlogFilterBar";
import BlogListItemCard from "@/components/blogs/BlogListItemCard";
import PaginationBar from "@/components/projects/PaginationBar";
import { type BlogItem } from "@/data/blogsData";
import { apiGet } from "@/lib/api";

const PAGE_SIZE = 6;

const DEFAULT_FILTERS: BlogFilterState = {
  tags: [],
  sortBy: "Newest",
};

const EmptyState = ({ onClear }: { onClear: () => void }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
      <BookOpen size={28} className="text-primary" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-foreground">No blogs match your filters</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Try adjusting your filters to discover more articles.
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

const BlogsPage = () => {
  const [filters, setFilters] = useState<BlogFilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          pageSize: String(PAGE_SIZE),
          sortBy: filters.sortBy,
        });
        if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));

        const response = await apiGet<{
          success: boolean;
          data: { blogs: BlogItem[]; total: number; page: number; pageSize: number };
        }>(`/blogs/public?${params.toString()}`);

        setBlogs(response.data.blogs || []);
        setTotal(response.data.total || 0);
      } catch (err: any) {
        setError(err?.message || "Failed to load blogs");
        setBlogs([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [filters, currentPage]);

  const handleFilterChange = (f: BlogFilterState) => { setFilters(f); setCurrentPage(1); };
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
                    Explore <span className="gradient-text">Blogs</span>
                  </h1>
                  <p className="text-base text-muted-foreground max-w-lg leading-relaxed">
                    Read technical writeups, career stories, and learning experiences shared by the Kollab community.
                  </p>
                </div>
                <Link
                  to="/blogs/create"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <PenLine size={16} />
                  Write a Blog
                </Link>
              </div>
              <div className="hidden md:flex flex-shrink-0 items-center justify-center lg:w-[320px] xl:w-[380px]">
                <BlogsHeroIllustration className="w-full" />
              </div>
            </div>
          </Container>
        </div>

        <Container className="py-6 space-y-6">
          {/* Filters */}
          <div className="rounded-xl border border-border bg-card p-4">
            <BlogFilterBar filters={filters} onChange={handleFilterChange} onClear={handleClear} />
          </div>

          {/* Count */}
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{total}</span> blog{total !== 1 ? "s" : ""} found
          </p>

          {/* List */}
          {loading ? (
            <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading blogs...</div>
          ) : error ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
              {error}
            </div>
          ) : blogs.length === 0 ? (
            <EmptyState onClear={handleClear} />
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <BlogListItemCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > PAGE_SIZE && (
            <PaginationBar
              totalItems={total}
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

export default BlogsPage;
