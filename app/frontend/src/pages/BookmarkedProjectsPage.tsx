import { useEffect, useState } from "react";
import { Bookmark, FolderOpen } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import ProjectCard, { type ProjectCardProject } from "@/components/projects/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { getSession } from "@/lib/authStore";

const BookmarkedSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
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
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
      <FolderOpen size={28} className="text-primary" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-foreground">No bookmarked projects yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Browse projects and tap the bookmark icon to save them here.
      </p>
    </div>
  </div>
);

const BookmarkedProjectsPage = () => {
  const [projects, setProjects] = useState<ProjectCardProject[]>([]);
  const [loading, setLoading] = useState(true);

  const handleToggle = async (projectId: string, next: boolean) => {
    try {
      if (next) {
        await apiPost("/bookmarks/" + projectId);
      } else {
        await apiDelete("/bookmarks/" + projectId);
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      }
    } catch (err) {
      console.error("Bookmark toggle failed", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const session = getSession();
        if (!session) {
          setProjects([]);
          return;
        }
        const res = await apiGet<{ success: boolean; data: { projects: any[] } }>("/bookmarks");
        const mapped = (res?.data?.projects ?? []).map((p) => ({
          id: p._id || p.id,
          title: p.title,
          summary: p.summary,
          domain: p.domain,
          difficulty: p.difficulty,
          status: p.status,
          technologies: p.technologies || [],
          tags: p.tags || [],
          postedAt: p.postedAt || p.createdAt || new Date().toISOString(),
          compensation: p.compensation,
          weeklyHours: p.weeklyHours,
          duration: p.duration,
          posterImage: p.posterImage,
          posterName: p.owner?.name || "Project owner",
          posterAvatar: p.owner?.avatar,
          posterRating: p.owner?.rating,
          roles: (p.roles || []).map((role: any) => ({
            title: role.title,
            status: role.status,
            total: role.seats,
            filled: role.status === "Filled" ? role.seats : 0,
          })),
        })) as ProjectCardProject[];
        setProjects(mapped);
      } catch (err) {
        console.error("Failed to load bookmarks", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <Container className="py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Bookmark size={18} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground">Bookmarked Projects</h1>
                <p className="text-sm text-muted-foreground">Saved projects across Kollab.</p>
              </div>
            </div>
          </div>

          {loading ? (
            <BookmarkedSkeleton />
          ) : projects.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} bookmarked onToggleBookmark={handleToggle} />
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default BookmarkedProjectsPage;
