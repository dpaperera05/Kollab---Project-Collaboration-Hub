import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Save, User, Link2, Star, Check, Search, X } from "lucide-react";
import { type KollabUser, updateUserProfile } from "@/lib/authStore";

interface Props { user: KollabUser; onUpdate: () => void; }

const EXPERTISE_OPTIONS = ["React", "TypeScript", "Node.js", "Python", "Java", "Machine Learning", "Data Science", "UI/UX Design", "DevOps", "Cloud Architecture", "Mobile Dev", "Cybersecurity", "Blockchain", "System Design", "Project Management"];
const DOMAIN_OPTIONS = ["AI & ML", "Web Dev", "Mobile Dev", "Data Science", "Cybersecurity", "IoT", "Robotics", "Software Engineering", "DevOps", "Cloud", "Blockchain", "Game Dev"];
const LANGUAGE_OPTIONS = ["English", "Sinhala", "Tamil", "Hindi", "Japanese", "Korean", "Chinese", "French", "German", "Spanish"];

const TagPicker = ({ label, options, selected, onChange }: { label: string; options: string[]; selected: string[]; onChange: (s: string[]) => void }) => {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => search.trim() ? options.filter(o => o.toLowerCase().includes(search.toLowerCase())) : options, [search, options]);
  const toggle = (val: string) => onChange(selected.includes(val) ? selected.filter(s => s !== val) : [...selected, val]);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(t => (
            <Badge key={t} className="gap-1 pr-1.5 bg-primary text-primary-foreground">
              {t}<button onClick={() => toggle(t)} className="ml-0.5 hover:opacity-70"><X size={10} /></button>
            </Badge>
          ))}
        </div>
      )}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${label.toLowerCase()}...`} className="pl-9" />
      </div>
      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
        {filtered.map(o => (
          <button key={o} onClick={() => toggle(o)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${selected.includes(o) ? "bg-primary/10 text-primary border-primary" : "chip hover:border-primary/30"}`}>
            {selected.includes(o) && <Check size={10} strokeWidth={3} />}{o}
          </button>
        ))}
      </div>
    </div>
  );
};

const MentorProfileTab = ({ user, onUpdate }: Props) => {
  const p = user.profile || {};
  const [name, setName] = useState(p.name || "");
  const [bio, setBio] = useState(p.bio || "");
  const [headline, setHeadline] = useState((p as any).headline || "");
  const [expertise, setExpertise] = useState<string[]>(p.expertiseSkills || []);
  const [domains, setDomains] = useState<string[]>(p.domainInterests || []);
  const [languages, setLanguages] = useState<string[]>((p as any).languages || ["English"]);
  const [rate, setRate] = useState((p as any).rateType === "paid" ? "Paid" : "Free");
  const [rateNote, setRateNote] = useState((p as any).rateNote || "");
  const [github, setGithub] = useState(p.links?.github || "");
  const [linkedin, setLinkedin] = useState(p.links?.linkedin || "");
  const [portfolio, setPortfolio] = useState(p.links?.portfolio || "");

  const save = () => {
    updateUserProfile({
      name,
      bio,
      headline,
      expertiseSkills: expertise,
      domainInterests: domains,
      languages,
      rateType: rate === "Paid" ? "paid" : "free",
      rateNote: rate === "Paid" ? rateNote.trim() : "",
      links: { github, linkedin, portfolio },
    });
    onUpdate();
    toast({ title: "Mentor profile updated" });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Identity */}
        <Card className="border-border card-shadow">
          <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><User size={16} className="text-primary" /> Professional Identity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Full Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Headline</Label><Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Senior React Developer & Mentor" /></div>
            <div><Label>Bio</Label><Textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Your professional background..." /></div>
            <div>
              <Label>Rate</Label>
              <div className="flex gap-2 mt-1">
                {["Free", "Paid"].map(r => (
                  <button key={r} onClick={() => setRate(r)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${rate === r ? "bg-primary text-primary-foreground border-primary" : "chip"}`}>{r}</button>
                ))}
              </div>
              {rate === "Paid" && (
                <Input
                  className="mt-2"
                  placeholder="e.g. LKR 2500 / session"
                  value={rateNote}
                  onChange={(e) => setRateNote(e.target.value)}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card className="border-border card-shadow">
          <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><Link2 size={16} className="text-primary" /> Links</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>GitHub</Label><Input value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/..." /></div>
            <div><Label>LinkedIn</Label><Input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
            <div><Label>Portfolio</Label><Input value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="https://..." /></div>
          </CardContent>
        </Card>

        {/* Expertise */}
        <Card className="border-border card-shadow">
          <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><Star size={16} className="text-primary" /> Expertise & Skills</CardTitle></CardHeader>
          <CardContent>
            <TagPicker label="Expertise Tags" options={EXPERTISE_OPTIONS} selected={expertise} onChange={setExpertise} />
          </CardContent>
        </Card>

        {/* Domains & Languages */}
        <Card className="border-border card-shadow">
          <CardContent className="space-y-6 pt-6">
            <TagPicker label="Domain Tags" options={DOMAIN_OPTIONS} selected={domains} onChange={setDomains} />
            <TagPicker label="Languages" options={LANGUAGE_OPTIONS} selected={languages} onChange={setLanguages} />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} className="gap-2 px-8"><Save size={16} /> Save Profile</Button>
      </div>
    </div>
  );
};

export default MentorProfileTab;
