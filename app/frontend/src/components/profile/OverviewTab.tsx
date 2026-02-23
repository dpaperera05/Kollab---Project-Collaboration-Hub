import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Save, UserCircle, Link2, Globe, Briefcase } from "lucide-react";
import { type KollabUser, updateUserProfile } from "@/lib/authStore";

interface Props { user: KollabUser; onUpdate: () => void; }

const DOMAIN_OPTIONS = ["AI & ML", "Web Dev", "Mobile Dev", "Data Science", "Cybersecurity", "IoT", "Robotics", "Software Engineering", "DevOps", "Cloud", "Blockchain", "Game Dev"];
const ROLE_OPTIONS = ["Developer", "Designer", "Data Analyst", "DevOps", "PM", "Researcher", "QA Engineer", "Technical Writer"];

const OverviewTab = ({ user, onUpdate }: Props) => {
  const p = user.profile || {};
  const [name, setName] = useState(p.name || "");
  const [bio, setBio] = useState(p.bio || "");
  const [timezone, setTimezone] = useState(p.timezone || "");
  const [location, setLocation] = useState(p.location || "");
  const [github, setGithub] = useState(p.links?.github || "");
  const [linkedin, setLinkedin] = useState(p.links?.linkedin || "");
  const [portfolio, setPortfolio] = useState(p.links?.portfolio || "");
  const [hours, setHours] = useState(p.availabilityHoursPerWeek ?? 10);
  const [domains, setDomains] = useState<string[]>(p.domainInterests || []);
  const [roles, setRoles] = useState<string[]>(user.userType === "mentor" ? (p.expertiseSkills || []) : (p.preferredRoles || []));

  const toggleChip = (list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setter(list.includes(val) ? list.filter(v => v !== val) : [...list, val]);
  };

  const save = () => {
    const data: Record<string, unknown> = {
      name, bio, timezone, location,
      links: { github, linkedin, portfolio },
      availabilityHoursPerWeek: hours,
      domainInterests: domains,
    };
    if (user.userType === "mentor") data.expertiseSkills = roles;
    else data.preferredRoles = roles;
    updateUserProfile(data as any);
    onUpdate();
    toast({ title: "Profile updated" });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card className="border-border card-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2"><UserCircle size={16} className="text-primary" />Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Full Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></div>
            <div><Label>Bio</Label><Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Short bio..." rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Timezone</Label><Input value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="e.g. UTC+5:30" /></div>
              <div><Label>Location</Label><Input value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" /></div>
            </div>
            <div><Label>Availability (hrs/week)</Label><Input type="number" min={0} max={60} value={hours} onChange={e => setHours(Number(e.target.value))} /></div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card className="border-border card-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2"><Link2 size={16} className="text-primary" />Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label>GitHub</Label><Input value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/..." /></div>
            <div><Label>LinkedIn</Label><Input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
            <div><Label>Portfolio</Label><Input value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="https://..." /></div>
          </CardContent>
        </Card>

        {/* Domain Interests */}
        <Card className="border-border card-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2"><Globe size={16} className="text-primary" />Domain Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {DOMAIN_OPTIONS.map(d => (
                <button key={d} onClick={() => toggleChip(domains, setDomains, d)}
                  className={`chip px-3 py-1.5 rounded-full text-xs font-medium transition-all ${domains.includes(d) ? "bg-primary text-primary-foreground border-primary" : ""}`}>
                  {d}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Roles */}
        <Card className="border-border card-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2"><Briefcase size={16} className="text-primary" />{user.userType === "mentor" ? "Expertise Areas" : "Preferred Roles"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map(r => (
                <button key={r} onClick={() => toggleChip(roles, setRoles, r)}
                  className={`chip px-3 py-1.5 rounded-full text-xs font-medium transition-all ${roles.includes(r) ? "bg-primary text-primary-foreground border-primary" : ""}`}>
                  {r}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={save} className="gap-2 px-8">
          <Save size={16} /> Save Changes
        </Button>
      </div>
    </div>
  );
};

export default OverviewTab;
