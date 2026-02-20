import { Zap, FolderOpen } from "lucide-react";
import Container from "@/components/ui/Container";

const FinalCTA = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(270 80% 60% / 0.08), transparent 70%)",
        }}
      />

      <Container className="relative z-10">
        <div className="rounded-3xl border border-border bg-card px-8 py-16 sm:px-16 text-center card-shadow">
          {/* Badge */}
          <span className="chip inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase mb-6">
            Start for free
          </span>

          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Build proof.{" "}
            <span className="gradient-text">Get noticed.</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Join thousands of students who are turning their projects into career proof — one verified contribution at a time.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-primary-foreground rounded-xl bg-primary shadow-brand hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_8px_30px_hsl(270_80%_60%_/_0.4)] transition-all duration-200"
            >
              <Zap size={16} />
              Get Started
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl border border-border hover:bg-accent transition-all duration-200 hover:-translate-y-0.5 text-foreground"
            >
              <FolderOpen size={16} />
              Explore Projects
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default FinalCTA;
