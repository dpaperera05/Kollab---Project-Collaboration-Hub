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

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          📊 Skill Evidence
        </h3>
        <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full border border-border">
          Based on projects & showcases
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(240, 5%, 50%)" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="skill" width={90} tick={{ fontSize: 12, fill: "hsl(240, 10%, 40%)", fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "hsl(270, 80%, 60%, 0.06)" }}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 12px hsl(0 0% 0% / 0.1)",
              }}
              formatter={(value?: number) => [`${value ?? 0}%`, "Evidence"]}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={20}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SkillEvidenceGraph;
