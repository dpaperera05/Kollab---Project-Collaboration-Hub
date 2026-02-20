import { Star, ShieldCheck, CalendarCheck } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";

const mentors = [
  {
    name: "Amara Nwosu",
    role: "Senior Software Engineer",
    company: "Google",
    avatar: "AN",
    tags: ["React", "System Design", "Career Coaching"],
    rating: 4.9,
    reviews: 47,
  },
  {
    name: "Liam Chen",
    role: "Product Manager",
    company: "Spotify",
    avatar: "LC",
    tags: ["Product Strategy", "UX Research", "Agile"],
    rating: 4.8,
    reviews: 32,
  },
  {
    name: "Priya Sharma",
    role: "Data Scientist",
    company: "DeepMind",
    avatar: "PS",
    tags: ["ML/AI", "Python", "Data Viz"],
    rating: 5.0,
    reviews: 61,
  },
  {
    name: "Marcus Osei",
    role: "DevOps Lead",
    company: "Cloudflare",
    avatar: "MO",
    tags: ["Kubernetes", "CI/CD", "Cloud Architecture"],
    rating: 4.7,
    reviews: 28,
  },
];

const avatarColors = [
  "from-violet-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-orange-500",
];

const Mentors = () => {
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mentors.map(({ name, role, company, avatar, tags, rating, reviews }, idx) => (
            <div
              key={name}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 card-shadow hover:card-shadow-hover"
            >
              {/* Avatar */}
              <div className={`mb-4 self-start flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${avatarColors[idx]} text-white text-sm font-bold shadow-brand-sm`}>
                {avatar}
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
                  <span className="text-sm font-semibold text-foreground">{rating}</span>
                  <span className="text-xs text-muted-foreground">({reviews} reviews)</span>
                </div>
              </div>

              {/* CTA */}
              <button className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary-foreground rounded-xl bg-primary shadow-brand-sm hover:bg-primary/90 hover:shadow-brand transition-all duration-200 hover:-translate-y-0.5">
                <CalendarCheck size={14} />
                Book session
              </button>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Mentors;
