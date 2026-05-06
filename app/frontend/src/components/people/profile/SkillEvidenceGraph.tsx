import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props {
  scores: Record<string, number>;
}

const COLORS = [
  "hsl(270, 80%, 60%)",
  "hsl(280, 70%, 62%)",
  "hsl(290, 65%, 64%)",
  "hsl(260, 70%, 58%)",
  "hsl(300, 60%, 62%)",
  "hsl(250, 65%, 60%)",
  "hsl(310, 55%, 64%)",
  "hsl(270, 60%, 56%)",
  "hsl(285, 70%, 60%)",
  "hsl(265, 75%, 62%)",
];

const SkillEvidenceGraph = ({ scores }: Props) => {
  const data = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, score]) => ({ skill, score }));

  const topSkills = data.slice(0, 3);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            📊 Skill Evidence
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Confidence based on projects, profile, and showcases
          </p>
        </div>
        <span className="text-[10px] text-muted-foreground px-2.5 py-1 rounded-full border border-border bg-muted/30 w-fit">
          Updated from live profile signals
        </span>
      </div>

      {topSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {topSkills.map((item, index) => (
            <span
              key={item.skill}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-medium text-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              {item.skill}
              <span className="text-muted-foreground">{item.score}%</span>
            </span>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border/70 bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.35))] p-3 sm:p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(240, 5%, 50%)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="skill" width={92} tick={{ fontSize: 12, fill: "hsl(240, 10%, 40%)", fontWeight: 500 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "hsl(270, 80%, 60%, 0.08)" }}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "10px",
                  fontSize: "12px",
                  boxShadow: "0 8px 24px hsl(0 0% 0% / 0.12)",
                }}
                formatter={(value?: number) => [`${value ?? 0}%`, "Evidence"]}
              />
              <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={20}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SkillEvidenceGraph;
