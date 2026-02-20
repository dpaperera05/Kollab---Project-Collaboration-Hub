import { BadgeCheck, BarChart3, FileText, ExternalLink } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";

const badges = [
  { label: "React", verified: true, level: 90 },
  { label: "TypeScript", verified: true, level: 78 },
  { label: "Node.js", verified: false, level: 55 },
  { label: "System Design", verified: true, level: 65 },
];

const proofPoints = [
  {
    icon: BadgeCheck,
    title: "Verified Contributions",
    description:
      "Every PR, commit, and collaboration is tracked and verified. No self-reporting — your work speaks for itself.",
  },
  {
    icon: BarChart3,
    title: "Skill Evidence Graph",
    description:
      "See visual proof of your skills built through real project work, with endorsements from teammates and mentors.",
  },
  {
    icon: FileText,
    title: "Exportable Resume",
    description:
      "Generate a professional resume pre-filled with verified project experience. Ready for job applications in seconds.",
  },
];

const PortfolioProof = () => {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <Container>
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          {/* Left: copy */}
          <div className="space-y-8">
            <SectionTitle
              label="Evidence Portfolio"
              title="Turn work into "
              highlight="proof"
              description="Kollab verifies your contributions so employers can trust what's on your portfolio — not just what you claim."
              align="left"
            />

            <div className="space-y-5">
              {proofPoints.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex-shrink-0 mt-0.5 flex items-center justify-center w-10 h-10 rounded-xl bg-primary-soft">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: UI mock */}
          <div className="relative">
            {/* Glow behind */}
            <div
              className="absolute inset-0 -z-10 rounded-3xl"
              style={{
                background:
                  "radial-gradient(ellipse at center, hsl(270 80% 60% / 0.15), transparent 70%)",
              }}
            />

            <div className="rounded-2xl border border-border bg-card p-6 card-shadow space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Career Readiness</p>
                  <p className="text-2xl font-bold text-foreground">78 / 100</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 px-2.5 py-1 text-xs font-medium">
                    <BadgeCheck size={11} />
                    Verified
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: "78%" }}
                />
              </div>

              {/* Skill badges */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Skill Evidence
                </p>
                {badges.map(({ label, verified, level }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        {verified && (
                          <BadgeCheck size={13} className="text-primary" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{level}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                          className="h-full rounded-full bg-primary opacity-80"
                          style={{ width: `${level}%` }}
                        />
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary-foreground rounded-xl bg-primary shadow-brand-sm hover:bg-primary/90 hover:shadow-brand transition-all">
                <ExternalLink size={13} />
                View Portfolio
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default PortfolioProof;
