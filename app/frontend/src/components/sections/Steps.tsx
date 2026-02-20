import {
  Search,
  Users,
  Lightbulb,
  BadgeCheck,
} from "lucide-react";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discover",
    description:
      "Browse open projects, roles, and challenges tailored to your interests and skill level.",
  },
  {
    number: "02",
    icon: Users,
    title: "Match & Apply",
    description:
      "Apply to roles or invite collaborators to your own projects. Find teammates who complement your skills.",
  },
  {
    number: "03",
    icon: Lightbulb,
    title: "Build Together",
    description:
      "Collaborate with your team, get mentorship, and work on real-world tasks that matter.",
  },
  {
    number: "04",
    icon: BadgeCheck,
    title: "Prove Your Skills",
    description:
      "Your contributions become verified portfolio evidence that employers trust.",
  },
];

const Steps = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <Container>
        <SectionTitle
          label="How it works"
          title="From discovery to "
          highlight="career proof"
          description="Four clear steps from finding your first project to landing your dream role."
          className="mb-16"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ number, icon: Icon, title, description }, idx) => (
            <div
              key={title}
              className="relative group rounded-2xl border p-6 bg-card transition-all duration-300 hover:-translate-y-1 card-shadow hover:card-shadow-hover"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Connector line for desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-6 h-px bg-gradient-to-r from-border to-transparent z-10" />
              )}

              {/* Step number */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-brand-subtle border border-primary/20">
                  <span className="text-xs font-bold gradient-text">{number}</span>
                </div>
              </div>

              {/* Icon */}
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-soft">
                <Icon size={22} className="text-primary" />
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at top left, hsl(270 80% 60% / 0.05), transparent 60%)" }}
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Steps;
