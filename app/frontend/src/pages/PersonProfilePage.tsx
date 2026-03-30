import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import ProfileSidebar from "@/components/people/profile/ProfileSidebar";
import ReadmeAboutCard from "@/components/people/profile/ReadmeAboutCard";
import TechBadges from "@/components/people/profile/TechBadges";
import PinnedShowcases from "@/components/people/profile/PinnedShowcases";
import ActivityTimeline from "@/components/people/profile/ActivityTimeline";
import type { PersonProfile, PinnedShowcase } from "@/data/mockPeople";
import { apiGet } from "@/lib/api";
import NotFound from "@/pages/NotFound";
import defaultAvatar from "@/assets/default-avatar.svg";

type MemberProfileResponse = {
  success: boolean;
  data: {
    user: any;
    stats?: { projectsCount?: number; showcasesCount?: number };
    pinnedShowcases?: PinnedShowcase[];
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
        const avatar = profile.avatarUrl || defaultAvatar;
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
          skillEvidenceScores: {},
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

  if (!loading && (!person || error)) return <NotFound />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Subtle header glow */}
        <div className="relative border-b border-border bg-card/50 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(270_80%_60%/0.06),transparent)] dark:bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(270_80%_60%/0.12),transparent)]" />
          <Container className="py-4">
            <Link
              to="/people"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              <ArrowLeft size={14} />
              Back to People
            </Link>
          </Container>
        </div>

        <Container className="py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-24">
                {loading || !person ? (
                  <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">Loading profile...</div>
                ) : (
                  <ProfileSidebar person={person} />
                )}
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-6">
              {loading || !person ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">Loading profile...</div>
              ) : (
                <>
                  <ReadmeAboutCard person={person} />
                  <TechBadges techStack={person.techStack} />
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
                </>
              )}
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default PersonProfilePage;
