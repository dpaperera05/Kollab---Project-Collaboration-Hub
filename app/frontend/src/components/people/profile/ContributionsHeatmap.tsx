import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKS = 52;
const DAYS = 7;

// Simple seeded random
const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const LEVELS = [
  "bg-muted",
  "bg-[hsl(270_60%_88%)] dark:bg-[hsl(270_40%_22%)]",
  "bg-[hsl(270_70%_76%)] dark:bg-[hsl(270_50%_32%)]",
  "bg-[hsl(270_80%_64%)] dark:bg-[hsl(270_60%_42%)]",
  "bg-primary",
];

const ContributionsHeatmap = ({ userId }: Props) => {
  const grid = useMemo(() => {
    const seed = Array.from(userId).reduce((a, c) => a + c.charCodeAt(0), 0);
    const rand = seededRandom(seed);
    const cells: number[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      const week: number[] = [];
      for (let d = 0; d < DAYS; d++) {
        const r = rand();
        const level = r < 0.35 ? 0 : r < 0.55 ? 1 : r < 0.75 ? 2 : r < 0.9 ? 3 : 4;
        week.push(level);
      }
      cells.push(week);
    }
    return cells;
  }, [userId]);

  const total = useMemo(() => grid.flat().filter((v) => v > 0).length, [grid]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">
          🔥 {total} contributions in the last year
        </h3>
      </div>

      {/* Month labels */}
      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          <div className="flex gap-[3px] mb-1 ml-8">
            {MONTHS.map((m, i) => (
              <span
                key={m}
                className="text-[10px] text-muted-foreground"
                style={{ width: `${(WEEKS / 12) * (13 + 3)}px` }}
              >
                {m}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-1">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <span key={i} className="text-[10px] text-muted-foreground h-[13px] flex items-center">
                  {d}
                </span>
              ))}
            </div>

            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((level, di) => (
                  <div
                    key={di}
                    className={cn("w-[13px] h-[13px] rounded-[3px] transition-colors", LEVELS[level])}
                    title={`${level > 0 ? level : "No"} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-[10px] text-muted-foreground">Less</span>
            {LEVELS.map((cls, i) => (
              <div key={i} className={cn("w-[13px] h-[13px] rounded-[3px]", cls)} />
            ))}
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionsHeatmap;
