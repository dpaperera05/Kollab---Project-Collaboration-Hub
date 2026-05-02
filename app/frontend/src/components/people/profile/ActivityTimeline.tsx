import { Layers, Briefcase, Award, Zap } from "lucide-react";
import type { ActivityItem } from "@/types/personProfile";
import { cn } from "@/lib/utils";

interface Props {
  activities: ActivityItem[];
}

const ICONS: Record<string, typeof Layers> = {
  showcase: Layers,
  project: Briefcase,
  simulation: Zap,
  badge: Award,
};

const COLORS: Record<string, string> = {
  showcase: "bg-primary/12 text-primary border border-primary/20",
  project: "bg-[hsl(200_60%_92%)] text-[hsl(200_60%_40%)] border border-[hsl(200_50%_78%)] dark:bg-[hsl(200_30%_18%)] dark:text-[hsl(200_60%_68%)]",
  simulation: "bg-[hsl(40_70%_92%)] text-[hsl(40_70%_35%)] border border-[hsl(40_55%_78%)] dark:bg-[hsl(40_30%_16%)] dark:text-[hsl(40_70%_65%)]",
  badge: "bg-[hsl(315_60%_92%)] text-[hsl(315_60%_40%)] border border-[hsl(315_45%_80%)] dark:bg-[hsl(315_30%_18%)] dark:text-[hsl(315_60%_65%)]",
};

const ActivityTimeline = ({ activities }: Props) => (
  <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
    <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
      ⚡ Recent Activity
    </h3>
    <p className="text-xs text-muted-foreground -mt-2">Latest public milestones and contributions.</p>

    <div className="relative space-y-0.5">
      <div className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-border via-border to-transparent" />

      {activities.map((item) => {
        const Icon = ICONS[item.type] || Layers;
        return (
          <div key={item.id} className="relative flex items-start gap-3 py-2.5">
            <div className={cn("relative z-10 flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0", COLORS[item.type])}>
              <Icon size={15} />
            </div>
            <div className="flex-1 min-w-0 rounded-xl border border-border/70 bg-muted/20 px-3.5 py-2.5">
              <p className="text-sm text-foreground/90 leading-snug">{item.text}</p>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium tracking-wide uppercase">{item.date}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default ActivityTimeline;
