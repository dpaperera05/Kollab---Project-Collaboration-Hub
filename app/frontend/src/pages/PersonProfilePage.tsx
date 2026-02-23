import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import ProfileSidebar from "@/components/people/profile/ProfileSidebar";
import ReadmeAboutCard from "@/components/people/profile/ReadmeAboutCard";
import TechBadges from "@/components/people/profile/TechBadges";
import SkillEvidenceGraph from "@/components/people/profile/SkillEvidenceGraph";
import PinnedShowcases from "@/components/people/profile/PinnedShowcases";

import ActivityTimeline from "@/components/people/profile/ActivityTimeline";
import { mockPeople } from "@/data/mockPeople";
import NotFound from "@/pages/NotFound";

const PersonProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const person = mockPeople.find((p) => p.id === id);

  if (!person) return <NotFound />;

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
                <ProfileSidebar person={person} />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-6">
              <ReadmeAboutCard person={person} />
              <TechBadges techStack={person.techStack} />
              {person.skillEvidenceScores && Object.keys(person.skillEvidenceScores).length > 0 && (
                <SkillEvidenceGraph scores={person.skillEvidenceScores} />
              )}
              {person.pinnedShowcases && person.pinnedShowcases.length > 0 && (
                <PinnedShowcases showcases={person.pinnedShowcases} />
              )}
              
              {person.activity && person.activity.length > 0 && (
                <ActivityTimeline activities={person.activity} />
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
