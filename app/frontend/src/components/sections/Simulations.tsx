import { Bug, Layers, Clock, Zap, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";

const challenges = [
  {
    icon: Bug,
    title: "Backend API Debug Sprint",
    description:
      "Identify and fix critical bugs in a Node.js REST API. Includes broken auth, N+1 queries, and race conditions.",
    difficulty: "Intermediate",
    difficultyColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
    time: "90 min",
    xp: 320,
    tags: ["Node.js", "REST", "Debugging"],
  },
  {
    icon: Layers,
    title: "UI Flow & UX Decisions",
    description:
      "Design and prototype a multi-step onboarding flow. You'll be graded on usability, accessibility, and coherence.",
    difficulty: "Beginner",
    difficultyColor: "text-green-600 bg-green-50 dark:bg-green-950/30",
    time: "60 min",
    xp: 200,
    tags: ["Figma", "UX", "Prototyping"],
  },
];

const Simulations = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <Container>
        <SectionTitle
          label="Job Simulations"
          title="Practice with "
          highlight="real challenges"
          description="Auto-graded challenges modelled on real job tasks. Earn XP, build your score, and prove you can deliver."
          className="mb-16"
        />

        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          {challenges.map(({ icon: Icon, title, description, difficulty, difficultyColor, time, xp, tags }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 card-shadow hover:card-shadow-hover"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-soft flex-shrink-0">
                  <Icon size={20} className="text-primary" />
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${difficultyColor}`}>
                  {difficulty}
                </span>
              </div>

              <h3 className="font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {time}
                </span>
                <span className="flex items-center gap-1">
                  <Trophy size={12} className="text-amber-400" />
                  <span className="font-semibold text-foreground">{xp}</span> XP
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            to="/simulations"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-primary-foreground rounded-xl bg-primary shadow-brand hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_8px_30px_hsl(270_80%_60%_/_0.4)] transition-all duration-200"
          >
            <Zap size={16} />
            Try a simulation
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default Simulations;
