import { Layers, Briefcase, Award, Zap } from "lucide-react";
import type { ActivityItem } from "@/data/mockPeople";
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
  showcase: "bg-primary/10 text-primary",
  project: "bg-[hsl(200_60%_92%)] text-[hsl(200_60%_40%)] dark:bg-[hsl(200_30%_18%)] dark:text-[hsl(200_60%_68%)]",
  simulation: "bg-[hsl(40_70%_92%)] text-[hsl(40_70%_35%)] dark:bg-[hsl(40_30%_16%)] dark:text-[hsl(40_70%_65%)]",
  badge: "bg-[hsl(315_60%_92%)] text-[hsl(315_60%_40%)] dark:bg-[hsl(315_30%_18%)] dark:text-[hsl(315_60%_65%)]",
};

const ActivityTimeline = ({ activities }: Props) => (
  <div className="rounded-xl border border-border bg-card p-5 space-y-4">
    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
      ⚡ Recent Activity
    </h3>

    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border" />

      {activities.map((item) => {
        const Icon = ICONS[item.type] || Layers;
        return (
          <div key={item.id} className="relative flex items-start gap-3 py-3">
            <div className={cn("relative z-10 flex items-center justify-center w-[35px] h-[35px] rounded-full flex-shrink-0", COLORS[item.type])}>
              <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm text-foreground/90 leading-snug">{item.text}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.date}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default ActivityTimeline;
