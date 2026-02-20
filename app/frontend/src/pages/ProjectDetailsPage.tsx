import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { mockProjects, type Project } from "@/data/mockProjects";
import { getAllProjects } from "@/lib/localProjects";
import ProjectHero from "@/components/projects/details/ProjectHero";
import ProjectOverview from "@/components/projects/details/ProjectOverview";
import RolesAccordion from "@/components/projects/details/RolesAccordion";
import TeamRow from "@/components/projects/details/TeamRow";
import RelatedProjects from "@/components/projects/details/RelatedProjects";
import OwnerCard from "@/components/projects/sidebar/OwnerCard";
import MessageOwnerWidget from "@/components/projects/sidebar/MessageOwnerWidget";

const DetailSkeleton = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <div className="pt-16">
      {/* Hero section */}
      <Skeleton className="w-full h-64" />
      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div className="space-y-6">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-52 rounded-xl" />
          </div>
        </div>
      </Container>
    </div>
  </div>
);

/* ── Not found ── */
const NotFoundState = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-16">
        <div className="text-center space-y-5 px-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <span className="text-3xl">🔍</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-foreground">Project Not Found</h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              This project doesn't exist or may have been removed.
            </p>
          </div>
          <button
            onClick={() => navigate("/projects")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-brand-sm"
          >
            <ArrowLeft size={15} />
            Back to Projects
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

/* ── Main page ── */
const ProjectDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null | "loading">("loading");

  useEffect(() => {
    setProject("loading");
    const allProjects = getAllProjects(mockProjects);
    const found = allProjects.find((p) => p.id === id) ?? null;
    const timer = setTimeout(() => setProject(found), 350);
    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    if (project !== "loading") {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
          document.documentElement.scrollTop = 0;
        });
      });
    }
  }, [project]);

  if (project === "loading") return <DetailSkeleton />;
  if (!project) return <NotFoundState />;

  const allProjects = getAllProjects(mockProjects);
  const relatedProjects = project.relatedProjectIds
    .map((rid) => allProjects.find((p) => p.id === rid))
    .filter(Boolean) as Project[];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Full-width hero */}
        <ProjectHero project={project} />

        {/* Two-column layout */}
        <Container className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-8 items-start">

            {/* ── LEFT column ── */}
            <div className="space-y-10 min-w-0">
              {/* Overview */}
              <ProjectOverview project={project} />

              <Separator />

              {/* Roles */}
              <RolesAccordion roles={project.roles} projectTitle={project.title} />

              <Separator />

              {/* Team */}
              <TeamRow members={project.teamMembers} />

              <Separator />

              <div className="lg:hidden space-y-4">
                <OwnerCard owner={project.owner} />
                <MessageOwnerWidget
                  ownerName={project.owner.name}
                  ownerAvatar={project.owner.avatar}
                />
              </div>

              <RelatedProjects projects={relatedProjects} />
            </div>

            <aside className="hidden lg:flex flex-col gap-4 sticky top-24">
              <OwnerCard owner={project.owner} />
              <MessageOwnerWidget
                ownerName={project.owner.name}
                ownerAvatar={project.owner.avatar}
              />
            </aside>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetailsPage;
