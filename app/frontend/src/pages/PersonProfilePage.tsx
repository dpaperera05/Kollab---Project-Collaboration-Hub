import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, Clock, Layers, MessageCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import ProfileSidebar from "@/components/people/profile/ProfileSidebar";
import ReadmeAboutCard from "@/components/people/profile/ReadmeAboutCard";
import TechBadges from "@/components/people/profile/TechBadges";
import PinnedShowcases from "@/components/people/profile/PinnedShowcases";
import SkillEvidenceGraph from "@/components/people/profile/SkillEvidenceGraph";
import ActivityTimeline from "@/components/people/profile/ActivityTimeline";
import type { PersonProfile, PinnedShowcase } from "@/types/personProfile";
import { apiGet } from "@/lib/api";
import NotFound from "@/pages/NotFound";
import { getDefaultAvatarUrl } from "@/lib/defaultAvatar";

type MemberProfileResponse = {
  success: boolean;
  data: {
    user: any;
    stats?: { projectsCount?: number; showcasesCount?: number };
    pinnedShowcases?: PinnedShowcase[];
    skillEvidenceScores?: Record<string, number>;
  };
};

type ActivityApiItem = {
  _id: string;
  type: string;
  description?: string;
  projectTitle?: string;
  blogTitle?: string;
  eventTitle?: string;
  createdAt: string;
};

const PersonProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<PersonProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityApiItem[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await apiGet<MemberProfileResponse>(`/profile/members/${id}`);
        const profile = res.data.user?.profile || {};
        const name = profile.name || res.data.user?.name || "Member";
        const avatar = profile.avatarUrl || getDefaultAvatarUrl(id || name);
        const stats = {
          projectsCount: res.data.stats?.projectsCount ?? 0,
          showcasesCount: res.data.stats?.showcasesCount ?? 0,
        };

        const mapped: PersonProfile = {
          id,
          name,
          avatar,
          bio: profile.bio || "",
          headline: profile.headline || "",
          preferredRoles: profile.preferredRoles || [],
          skills: profile.skills || [],
          techStack: profile.techStack || [],
          domainInterests: profile.domainInterests || [],
          availabilityHoursPerWeek: profile.availabilityHoursPerWeek || 0,
          isProfilePublic: res.data.user?.isProfilePublic !== false,
          stats,
          links: profile.links || {},
          pinnedShowcases: res.data.pinnedShowcases || [],
          skillEvidenceScores: res.data.skillEvidenceScores || {},
          activity: [],
        };

        setPerson(mapped);
        // Fetch recent activity
        try {
          const activityRes = await apiGet<{ success: boolean; data: { activities: ActivityApiItem[] } }>(`/activities/${id}?limit=12`);
          setActivities(activityRes.data.activities || []);
        } catch {
          setActivities([]);
        }
        setError(null);
      } catch (err: any) {
        setError(err?.message || "Failed to load profile");
        setPerson(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const hasPinned = useMemo(() => (person?.pinnedShowcases?.length ?? 0) > 0, [person]);
  const hasSkillEvidence = useMemo(
    () => Object.keys(person?.skillEvidenceScores || {}).length > 0,
    [person],
  );

  if (!loading && (!person || error)) return <NotFound />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="relative border-b border-border bg-card/50 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(270_80%_60%/0.06),transparent)] dark:bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(270_80%_60%/0.12),transparent)]" />
          <Container className="py-4">
            <button
              type="button"
              onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/people")}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              <ArrowLeft size={14} />
              Back to People
            </button>
          </Container>
        </div>

        <Container className="py-6 md:py-8 space-y-6">
          {loading || !person ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">Loading profile...</div>
          ) : (
            <>
              <section className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_85%_15%,hsl(270_75%_58%/0.12),transparent_40%),linear-gradient(160deg,hsl(var(--card)),hsl(var(--muted)/0.35))]" />
                <div className="relative p-5 sm:p-6 lg:p-8">
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center">
                    <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-2 border-white/70 bg-muted object-cover shadow-lg"
                      />
                      <div className="space-y-3 min-w-0">
                        <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                          Public Member Profile
                        </span>
                        <div className="space-y-1">
                          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                            {person.name}
                          </h1>
                          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                            {person.headline || "Collaborator building real-world outcomes through projects and showcases."}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {person.preferredRoles.slice(0, 4).map((role) => (
                            <span
                              key={role}
                              className="rounded-full border border-border/70 bg-background/75 px-3 py-1 text-xs font-semibold text-foreground"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="w-full xl:w-auto xl:min-w-[340px] space-y-3">
                      <button
                        type="button"
                        onClick={() => navigate("/messages")}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 transition-opacity"
                      >
                        <MessageCircle size={16} />
                        Message
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-3 gap-2.5">
                        <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-3">
                          <p className="text-[11px] text-muted-foreground font-medium">Projects</p>
                          <p className="mt-1 text-xl font-bold text-foreground flex items-center gap-1.5">
                            <Briefcase size={14} className="text-primary" />
                            {person.stats.projectsCount}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-3">
                          <p className="text-[11px] text-muted-foreground font-medium">Showcases</p>
                          <p className="mt-1 text-xl font-bold text-foreground flex items-center gap-1.5">
                            <Layers size={14} className="text-primary" />
                            {person.stats.showcasesCount}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-3">
                          <p className="text-[11px] text-muted-foreground font-medium">Availability</p>
                          <p className="mt-1 text-xl font-bold text-foreground flex items-center gap-1.5">
                            <Clock size={14} className="text-primary" />
                            {person.availabilityHoursPerWeek}h
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8">
                <div className="min-w-0 space-y-6">
                  <ReadmeAboutCard person={person} />
                  {hasSkillEvidence && (
                    <SkillEvidenceGraph scores={person.skillEvidenceScores!} />
                  )}
                  {hasPinned && <PinnedShowcases showcases={person.pinnedShowcases!} />}
                  {activities.length > 0 && (
                    <ActivityTimeline
                      activities={activities.map((a) => ({
                        id: a._id,
                        type:
                          a.type === "project_created" || a.type === "project_updated"
                            ? "project"
                            : a.type === "blog_published"
                              ? "showcase"
                              : a.type === "event_created"
                                ? "simulation"
                                : "badge",
                        text:
                          a.description ||
                          a.projectTitle ||
                          a.blogTitle ||
                          a.eventTitle ||
                          "Activity",
                        date: new Date(a.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
                      }))}
                    />
                  )}
                </div>

                <aside className="space-y-4 xl:sticky xl:top-24 self-start">
                  <ProfileSidebar person={person} />
                  <TechBadges techStack={person.techStack} />
                </aside>
              </div>
            </>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default PersonProfilePage;
