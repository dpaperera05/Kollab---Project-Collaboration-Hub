import { Star, ShieldCheck, CalendarCheck } from "lucide-react";
import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import { apiGet } from "@/lib/api";
import type { KollabUser } from "@/lib/authStore";

const avatarColors = [
  "from-violet-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-orange-500",
];

interface MentorCardData {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  tags: string[];
  rating: number;
  reviews: number;
}

const Mentors = () => {
  const [mentors, setMentors] = useState<MentorCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await apiGet<{ success: boolean; data: { users: KollabUser[] } }>("/profile/mentors");
        
        const mentorData = response.data.users
          .slice(0, 4)
          .map((user) => {
            const initials = user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            
            const skills = user.skills || [];
            const tags = skills.slice(0, 3);
            
            return {
              id: user._id,
              name: user.name,
              role: user.headline || "Mentor",
              company: user.affiliation || "Independent",
              avatar: user.avatar || initials,
              tags,
              rating: user.mentorRating || 5.0,
              reviews: user.reviewCount || 0,
            };
          });
        
        setMentors(mentorData);
      } catch (error) {
        console.error("Failed to fetch mentors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  return (
    <section className="py-24 bg-secondary/30">
      <Container>
        <div className="mb-16 text-center">
          <SectionTitle
            label="Mentorship"
            title="Mentors you can "
            highlight="book today"
            description="Work directly with professionals from top companies. All mentors are verified by our admin team."
          />
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck size={14} className="text-primary" />
            <span>All mentors are verified by Kollab administrators</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading mentors...</div>
        ) : mentors.length === 0 ? (
          <div className="text-center text-muted-foreground">No mentors available at the moment.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mentors.map(({ id, name, role, company, avatar, tags, rating, reviews }, idx) => {
            const isAvatarUrl = avatar.startsWith("http") || avatar.startsWith("/");
            
            return (
              <div
                key={id}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 card-shadow hover:card-shadow-hover"
              >
                {/* Avatar */}
                <div className="mb-4 self-start">
                  {isAvatarUrl ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="w-12 h-12 rounded-full object-cover shadow-brand-sm"
                    />
                  ) : (
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${avatarColors[idx]} text-white text-sm font-bold shadow-brand-sm`}>
                      {avatar}
                    </div>
                  )}
                </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {role} · {company}
                </p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary-soft text-primary px-2.5 py-0.5 text-[10px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Rating */}
                <div className="mt-3 flex items-center gap-1.5">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({reviews} reviews)</span>
                </div>
              </div>

              {/* CTA */}
              <a
                href={`/mentors/${id}`}
                className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary-foreground rounded-xl bg-primary shadow-brand-sm hover:bg-primary/90 hover:shadow-brand transition-all duration-200 hover:-translate-y-0.5"
              >
                <CalendarCheck size={14} />
                Book session
              </a>
            </div>
          );
        })}
          </div>
        )}
      </Container>
    </section>
  );
};

export default Mentors;
