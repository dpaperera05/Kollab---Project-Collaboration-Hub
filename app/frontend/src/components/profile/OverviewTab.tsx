import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Save, UserCircle, Link2, Globe, Briefcase, Pencil, Search, X, Check } from "lucide-react";
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
  const [editingDomains, setEditingDomains] = useState(false);
  const [editingRoles, setEditingRoles] = useState(false);
  const [domainsDraft, setDomainsDraft] = useState<string[]>(p.domainInterests || []);
  const [rolesDraft, setRolesDraft] = useState<string[]>(user.userType === "mentor" ? (p.expertiseSkills || []) : (p.preferredRoles || []));
  const [domainSearch, setDomainSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");

  const toggleChip = (list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setter(list.includes(val) ? list.filter(v => v !== val) : [...list, val]);
  };

  const filteredDomains = useMemo(() => {
    if (!domainSearch.trim()) return DOMAIN_OPTIONS;
    const q = domainSearch.toLowerCase();
    return DOMAIN_OPTIONS.filter((d) => d.toLowerCase().includes(q));
  }, [domainSearch]);

  const filteredRoles = useMemo(() => {
    if (!roleSearch.trim()) return ROLE_OPTIONS;
    const q = roleSearch.toLowerCase();
    return ROLE_OPTIONS.filter((r) => r.toLowerCase().includes(q));
  }, [roleSearch]);

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

  const saveDomains = () => {
    setDomains(domainsDraft);
    updateUserProfile({ domainInterests: domainsDraft });
    onUpdate();
    setEditingDomains(false);
    toast({ title: "Domain interests updated" });
  };

  const saveRoles = () => {
    setRoles(rolesDraft);
    const data: Record<string, unknown> = {};
    if (user.userType === "mentor") data.expertiseSkills = rolesDraft;
    else data.preferredRoles = rolesDraft;
    updateUserProfile(data as any);
    onUpdate();
    setEditingRoles(false);
    toast({ title: `${user.userType === "mentor" ? "Expertise areas" : "Preferred roles"} updated` });
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
          <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2"><Globe size={16} className="text-primary" />Domain Interests</CardTitle>
            {!editingDomains && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDomainsDraft(domains);
                  setDomainSearch("");
                  setEditingDomains(true);
                }}
                className="gap-1.5"
              >
                <Pencil size={13} /> Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editingDomains ? (
              <>
                {domainsDraft.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {domainsDraft.map((d) => (
                      <Badge key={d} variant="default" className="gap-1 pr-1.5 bg-primary text-primary-foreground">
                        {d}
                        <button type="button" onClick={() => toggleChip(domainsDraft, setDomainsDraft, d)} className="ml-0.5 hover:opacity-70">
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="relative mb-4">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={domainSearch}
                    onChange={(e) => setDomainSearch(e.target.value)}
                    placeholder="Search domain interests..."
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                  {filteredDomains.map((d) => {
                    const isSelected = domainsDraft.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleChip(domainsDraft, setDomainsDraft, d)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                          isSelected
                            ? "bg-primary/10 text-primary border-primary"
                            : "chip hover:border-primary/30"
                        }`}
                      >
                        {isSelected && <Check size={10} strokeWidth={3} />}
                        {d}
                      </button>
                    );
                  })}
                  {filteredDomains.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2">No matches found</p>
                  )}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => { setDomainsDraft(domains); setEditingDomains(false); }}>
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={saveDomains}>Save</Button>
                </div>
              </>
            ) : (
              domains.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {domains.map((d) => (
                    <span key={d} className="chip px-3 py-1.5 rounded-full text-xs font-medium">
                      {d}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No domain interests added yet.</p>
              )
            )}
          </CardContent>
        </Card>

        {/* Roles */}
        <Card className="border-border card-shadow">
          <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2"><Briefcase size={16} className="text-primary" />{user.userType === "mentor" ? "Expertise Areas" : "Preferred Roles"}</CardTitle>
            {!editingRoles && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setRolesDraft(roles);
                  setRoleSearch("");
                  setEditingRoles(true);
                }}
                className="gap-1.5"
              >
                <Pencil size={13} /> Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editingRoles ? (
              <>
                {rolesDraft.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rolesDraft.map((r) => (
                      <Badge key={r} variant="default" className="gap-1 pr-1.5 bg-primary text-primary-foreground">
                        {r}
                        <button type="button" onClick={() => toggleChip(rolesDraft, setRolesDraft, r)} className="ml-0.5 hover:opacity-70">
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="relative mb-4">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    placeholder={`Search ${user.userType === "mentor" ? "expertise areas" : "preferred roles"}...`}
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                  {filteredRoles.map((r) => {
                    const isSelected = rolesDraft.includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleChip(rolesDraft, setRolesDraft, r)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                          isSelected
                            ? "bg-primary/10 text-primary border-primary"
                            : "chip hover:border-primary/30"
                        }`}
                      >
                        {isSelected && <Check size={10} strokeWidth={3} />}
                        {r}
                      </button>
                    );
                  })}
                  {filteredRoles.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2">No matches found</p>
                  )}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => { setRolesDraft(roles); setEditingRoles(false); }}>
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={saveRoles}>Save</Button>
                </div>
              </>
            ) : (
              roles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {roles.map((r) => (
                    <span key={r} className="chip px-3 py-1.5 rounded-full text-xs font-medium">
                      {r}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No roles added yet.</p>
              )
            )}
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
