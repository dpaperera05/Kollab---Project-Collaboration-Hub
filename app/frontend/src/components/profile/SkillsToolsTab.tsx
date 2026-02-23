import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Save, X, Search, Check } from "lucide-react";
import { type KollabUser, updateUserProfile } from "@/lib/authStore";

interface Props { user: KollabUser; onUpdate: () => void; }

const SUGGESTED_SKILLS = ["React", "TypeScript", "Node.js", "Python", "Java", "C++", "Go", "Rust", "SQL", "MongoDB", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "TensorFlow", "PyTorch", "Figma", "GraphQL", "Redis", "Swift", "Kotlin", "Ruby", "PHP", "Scala", "R", "MATLAB", "Haskell", "Dart", "Flutter"];
const SUGGESTED_TECH = ["React", "Next.js", "Vue", "Angular", "Express", "FastAPI", "Django", "Spring Boot", "PostgreSQL", "MySQL", "Firebase", "Supabase", "TailwindCSS", "Docker", "GitHub Actions", "Terraform", "Vite", "Webpack", "Redux", "Prisma", "Drizzle", "NestJS", "Svelte", "Remix", "Astro", "Nuxt"];

const ChipPicker = ({ label, options, selected, setSelected }: { label: string; options: string[]; selected: string[]; setSelected: (s: string[]) => void }) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(o => o.toLowerCase().includes(q));
  }, [search, options]);

  const toggle = (val: string) => {
    setSelected(selected.includes(val) ? selected.filter(s => s !== val) : [...selected, val]);
  };

  return (
    <Card className="border-border card-shadow">
      <CardHeader className="pb-4"><CardTitle className="text-base">{label}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {/* Selected tags */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map(t => (
              <Badge key={t} variant="default" className="gap-1 pr-1.5 bg-primary text-primary-foreground">
                {t}
                <button onClick={() => toggle(t)} className="ml-0.5 hover:opacity-70"><X size={12} /></button>
              </Badge>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}...`}
            className="pl-9"
          />
        </div>

        {/* Options grid */}
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
          {filtered.map(o => {
            const isSelected = selected.includes(o);
            return (
              <button
                key={o}
                onClick={() => toggle(o)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                  isSelected
                    ? "bg-primary/10 text-primary border-primary"
                    : "chip hover:border-primary/30"
                }`}
              >
                {isSelected && <Check size={10} strokeWidth={3} />}
                {o}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground py-2">No matches found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SkillsToolsTab = ({ user, onUpdate }: Props) => {
  const p = user.profile || {};
  const isMentor = user.userType === "mentor";

  const [skills, setSkills] = useState<string[]>(isMentor ? (p.expertiseSkills || []) : (p.skills || []));
  const [techStack, setTechStack] = useState<string[]>(p.techStack || []);

  const save = () => {
    const data: Record<string, unknown> = { techStack };
    if (isMentor) data.expertiseSkills = skills;
    else data.skills = skills;
    updateUserProfile(data as any);
    onUpdate();
    toast({ title: "Skills updated" });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <ChipPicker label={isMentor ? "Expertise Skills" : "Skills"} options={SUGGESTED_SKILLS} selected={skills} setSelected={setSkills} />
        <ChipPicker label="Tech Stack" options={SUGGESTED_TECH} selected={techStack} setSelected={setTechStack} />
      </div>
      <div className="flex justify-end">
        <Button onClick={save} className="gap-2 px-8"><Save size={16} /> Save Changes</Button>
      </div>
    </div>
  );
};

export default SkillsToolsTab;
