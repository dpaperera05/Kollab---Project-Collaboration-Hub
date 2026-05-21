import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDefaultAvatarUrl } from "@/lib/defaultAvatar";

import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { mockProjects, type Project, type ProjectRole, type TeamMember } from "@/data/mockProjects";
import { getAllProjects } from "@/lib/localProjects";
import { apiGet } from "@/lib/api";
import { getSession } from "@/lib/authStore";
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
  const [project, setProject] = useState<Project | null | "loading">("loading");

  type BackendRole = {
    id?: string;
    title: string;
    responsibilities?: string[];
    requiredSkills?: string[];
    niceToHaveSkills?: string[];
    level?: "Junior" | "Intermediate" | "Senior";
    seats?: number;
    status?: "Open" | "Filled";
  };

  type BackendProject = {
    _id: string;
    id?: string;
    title: string;
    summary: string;
    problemStatement?: string;
    deliverables?: string[];
    projectType: string;
    domain: string;
    technologies?: string[];
    difficulty: "Beginner" | "Intermediate" | "Advanced" | string;
    duration?: string;
    weeklyHours?: number;
    compensation?: string;
    posterImage?: string;
    tags?: string[];
    status: "Open" | "Ongoing" | "Filled" | "Finished";
    roles?: BackendRole[];
    members?: Array<{ userId: string; role?: string; status?: string; name?: string; avatar?: string }>;
    owner?: { id?: string; name?: string; avatar?: string; title?: string; rating?: number; projectsPosted?: number; userType?: "member" | "mentor" };
    postedAt?: string;
    createdAt?: string;
  };

  const adaptRole = (role: BackendRole): ProjectRole => ({
    title: role.title,
    level: role.level || "Junior",
    skills: role.requiredSkills || [],
    niceToHave: role.niceToHaveSkills || [],
    responsibilities: role.responsibilities || [],
    filled: role.status === "Filled" ? (role.seats || 1) : 0,
    total: role.seats || 1,
    status: role.status || "Open",
  });

  const adaptMembers = (members?: BackendProject["members"]): TeamMember[] => {
    if (!members || members.length === 0) return [];
    return members.map((m, idx) => ({
      id: m.userId || `member-${idx}`,
      name: m.name || "Team member",
      avatar: m.avatar || getDefaultAvatarUrl(m.userId || m.name),
      role: m.role || "Contributor",
    }));
  };

  const adaptProject = (p: BackendProject): Project => ({
    id: p.id || p._id,
    title: p.title,
    posterAvatar: p.owner?.avatar || getDefaultAvatarUrl(p.owner?.id || p.owner?.name),
    posterName: p.owner?.name || "Project Owner",
    posterRating: p.owner?.rating || 4.8,
    owner: {
      id: p.owner?.id || p.owner?.id || "owner",
      name: p.owner?.name || "Project Owner",
      avatar: p.owner?.avatar || getDefaultAvatarUrl(p.owner?.id || p.owner?.name),
      rating: p.owner?.rating || 4.8,
      title: p.owner?.title || "Project Owner",
      projectsPosted: p.owner?.projectsPosted || 1,
      userType: p.owner?.userType || "member",
    },
    domain: p.domain as Project["domain"],
    difficulty: (p.difficulty as Project["difficulty"]) || "Intermediate",
    status: p.status,
    projectType: p.projectType as Project["projectType"],
    summary: p.summary,
    description: p.summary,
    problemStatement: p.problemStatement || p.summary,
    deliverables: p.deliverables || [],
    duration: (p.duration as Project["duration"]) || "short-term",
    timeCommitment: p.weeklyHours ? `${p.weeklyHours} hrs/week` : "5-8 hrs/week",
    technologies: p.technologies || [],
    location: "Remote",
    compensation: (p.compensation as Project["compensation"]) || "None",
    roles: (p.roles || []).map(adaptRole),
    teamMembers: adaptMembers(p.members),
    relatedProjectIds: [],
    mentorLinked: false,
    postedAt: p.postedAt || p.createdAt || new Date().toISOString(),
    tags: p.tags || [],
    posterImage: p.posterImage || "/src/assets/posters/poster-resume-ai.jpg",
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setProject("loading");
      try {
        if (!id) {
          setProject(null);
          return;
        }
        const res = await apiGet<{ success: boolean; data: { project: BackendProject } }>(`/projects/public/${id}`);
        if (!cancelled && res?.data?.project) {
          setProject(adaptProject(res.data.project));
          return;
        }
      } catch (err) {
        console.error("Failed to load project", err);
      }

      if (!cancelled) {
        const allProjects = getAllProjects(mockProjects);
        const fallback = allProjects.find((p) => p.id === id) ?? null;
        setProject(fallback);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
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
  const session = getSession();
  const isOwnProject = Boolean(session?.id && project.owner?.id && session.id === project.owner.id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <ProjectHero project={project} />

        {/* Two-column layout */}
        <Container className="pt-10 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-8 items-start">

            {/* ── LEFT column ── */}
            <div className="space-y-10 min-w-0">
              {/* Overview */}
              <ProjectOverview project={project} />

              <Separator />

              {/* Team */}
              <TeamRow members={project.teamMembers} />

              <Separator />

              {/* Roles */}
              <RolesAccordion
                roles={project.roles}
                projectTitle={project.title}
                projectId={project.id}
                projectStatus={project.status}
              />

              <Separator />

              <div className="lg:hidden space-y-4">
                <OwnerCard owner={project.owner} />
                {!isOwnProject && (
                  <MessageOwnerWidget
                    ownerId={project.owner.id}
                    ownerName={project.owner.name}
                    ownerAvatar={project.owner.avatar}
                    projectId={project.id}
                  />
                )}
              </div>

              <RelatedProjects projects={relatedProjects} />
            </div>

            <aside className="hidden lg:flex flex-col gap-4 sticky top-24">
              <OwnerCard owner={project.owner} />
              {!isOwnProject && (
                <MessageOwnerWidget
                  ownerId={project.owner.id}
                  ownerName={project.owner.name}
                  ownerAvatar={project.owner.avatar}
                  projectId={project.id}
                />
              )}
            </aside>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetailsPage;
