import { cn } from "@/lib/utils";

interface Props {
  techStack: string[];
}

const BADGE_STYLES: Record<string, string> = {
  "React": "bg-[hsl(200_80%_94%)] text-[hsl(200_80%_35%)] border-[hsl(200_60%_82%)] dark:bg-[hsl(200_40%_18%)] dark:text-[hsl(200_80%_70%)] dark:border-[hsl(200_40%_30%)]",
  "Next.js": "bg-[hsl(0_0%_94%)] text-[hsl(0_0%_15%)] border-[hsl(0_0%_82%)] dark:bg-[hsl(0_0%_18%)] dark:text-[hsl(0_0%_85%)] dark:border-[hsl(0_0%_30%)]",
  "TypeScript": "bg-[hsl(210_80%_94%)] text-[hsl(210_80%_35%)] border-[hsl(210_60%_82%)] dark:bg-[hsl(210_40%_18%)] dark:text-[hsl(210_80%_70%)] dark:border-[hsl(210_40%_30%)]",
  "Python": "bg-[hsl(55_70%_92%)] text-[hsl(210_60%_35%)] border-[hsl(55_50%_78%)] dark:bg-[hsl(55_30%_16%)] dark:text-[hsl(55_70%_70%)] dark:border-[hsl(55_30%_30%)]",
  "Docker": "bg-[hsl(200_75%_94%)] text-[hsl(200_75%_35%)] border-[hsl(200_55%_82%)] dark:bg-[hsl(200_35%_18%)] dark:text-[hsl(200_75%_70%)] dark:border-[hsl(200_35%_30%)]",
  "AWS": "bg-[hsl(35_80%_92%)] text-[hsl(35_80%_30%)] border-[hsl(35_60%_78%)] dark:bg-[hsl(35_40%_16%)] dark:text-[hsl(35_80%_68%)] dark:border-[hsl(35_40%_30%)]",
  "Tailwind CSS": "bg-[hsl(180_60%_92%)] text-[hsl(180_60%_30%)] border-[hsl(180_40%_78%)] dark:bg-[hsl(180_30%_16%)] dark:text-[hsl(180_60%_68%)] dark:border-[hsl(180_30%_30%)]",
  "Go": "bg-[hsl(190_60%_92%)] text-[hsl(190_60%_30%)] border-[hsl(190_40%_78%)] dark:bg-[hsl(190_30%_16%)] dark:text-[hsl(190_60%_68%)] dark:border-[hsl(190_30%_30%)]",
  "PostgreSQL": "bg-[hsl(215_60%_94%)] text-[hsl(215_60%_35%)] border-[hsl(215_40%_82%)] dark:bg-[hsl(215_30%_18%)] dark:text-[hsl(215_60%_70%)] dark:border-[hsl(215_30%_30%)]",
  "MongoDB": "bg-[hsl(140_50%_92%)] text-[hsl(140_50%_28%)] border-[hsl(140_30%_78%)] dark:bg-[hsl(140_25%_16%)] dark:text-[hsl(140_50%_65%)] dark:border-[hsl(140_25%_30%)]",
  "Firebase": "bg-[hsl(40_80%_92%)] text-[hsl(40_80%_30%)] border-[hsl(40_60%_78%)] dark:bg-[hsl(40_40%_16%)] dark:text-[hsl(40_80%_68%)] dark:border-[hsl(40_40%_30%)]",
  "Unity": "bg-[hsl(0_0%_93%)] text-[hsl(0_0%_20%)] border-[hsl(0_0%_80%)] dark:bg-[hsl(0_0%_16%)] dark:text-[hsl(0_0%_80%)] dark:border-[hsl(0_0%_30%)]",
};

const DEFAULT_STYLE = "bg-primary/10 text-primary border-primary/20";

const TechBadges = ({ techStack }: Props) => (
  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
    <h3 className="text-sm font-bold tracking-tight text-foreground mb-1 flex items-center gap-2">
      🛠️ Tech Stack
    </h3>
    <p className="text-xs text-muted-foreground mb-3">Tools and technologies used across projects.</p>
    <div className="flex flex-wrap gap-2">
      {techStack.map((tech) => (
        <span
          key={tech}
          className={cn(
            "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border",
            BADGE_STYLES[tech] || DEFAULT_STYLE
          )}
        >
          {tech}
        </span>
      ))}
    </div>
  </div>
);

export default TechBadges;
