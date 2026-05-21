import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import heroBgDark from "@/assets/hero-bg-dark.jpg";
import heroBgLight from "@/assets/hero-bg-light.jpg";
import Container from "@/components/ui/Container";

const chips = ["Collaborate", "Build", "Prove Skills"];

const stats = [
  { value: "250+", label: "Projects" },
  { value: "1,200+", label: "Builders" },
  { value: "60+", label: "Mentors" },
];

const Hero = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={isDark ? heroBgDark : heroBgLight}
          alt=""
          className="w-full h-full object-cover transition-opacity duration-500"
          aria-hidden="true"
        />
        {/* Overlay */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isDark
              ? "bg-background/70"
              : "bg-background/50"
          }`}
        />
      </div>

      {/* Radial glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, hsl(270 80% 60% / 0.12), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <Container className="relative z-10 py-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-8">
          {/* Chips */}
          <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
            {chips.map((chip) => (
              <span
                key={chip}
                className="chip rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide"
              >
                {chip}
              </span>
            ))}
          </div>

          {/* Headline */}
          <div className="animate-fade-up">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-foreground">
              Launch Your{" "}
              <span className="gradient-text">Tech Career</span>
            </h1>
          </div>

          {/* Subheadline */}
          <p
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            Discover projects, find teammates, book mentors, and build an
            evidence-based portfolio that proves your skills.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap gap-3 justify-center animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            <a
              href="/register"
              className="px-7 py-3.5 text-sm font-semibold text-primary-foreground rounded-xl bg-primary shadow-brand hover:-translate-y-0.5 transition-all duration-200 hover:bg-primary/90 hover:shadow-[0_8px_30px_hsl(270_80%_60%_/_0.4)]"
            >
              Get Started
            </a>
            <a
              href="/projects"
              className="px-7 py-3.5 text-sm font-semibold text-foreground rounded-xl border border-border bg-background/60 backdrop-blur-sm hover:bg-accent hover:-translate-y-0.5 transition-all duration-200"
            >
              Explore Projects
            </a>
          </div>

          {/* Stats */}
          <div
            className="flex flex-wrap justify-center gap-3 mt-2 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            {stats.map(({ value, label }, i) => (
              <div
                key={label}
                className={`flex items-center gap-2 ${i !== 0 ? "border-l border-border pl-3" : ""}`}
              >
                <span className="text-2xl font-bold gradient-text">{value}</span>
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
