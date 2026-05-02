import { ShieldCheck, Clock3, Target, Sparkles, Github, Linkedin, Globe, Copy, Check } from "lucide-react";
import type { PersonProfile } from "@/types/personProfile";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Props {
  person: PersonProfile;
}

const ProfileSidebar = ({ person }: Props) => {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles size={14} className="text-primary" />
          Quick Facts
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
            <span className="text-xs text-muted-foreground">Availability</span>
            <span className="text-xs font-semibold text-foreground inline-flex items-center gap-1.5">
              <Clock3 size={12} className="text-primary" />
              {person.availabilityHoursPerWeek} hrs/week
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
            <span className="text-xs text-muted-foreground">Profile Visibility</span>
            <span className="text-xs font-semibold text-foreground inline-flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
              {person.isProfilePublic ? "Public" : "Private"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
            <span className="text-xs text-muted-foreground">Focus Areas</span>
            <span className="text-xs font-semibold text-foreground inline-flex items-center gap-1.5">
              <Target size={12} className="text-primary" />
              {person.domainInterests.length}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Roles</h3>
        <div className="flex flex-wrap gap-2">
          {person.preferredRoles.map((r) => (
            <span key={r} className="px-2.5 py-1 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-semibold">
              {r}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interests</h3>
        <div className="flex flex-wrap gap-2">
          {person.domainInterests.map((d) => (
            <span key={d} className="px-2.5 py-1 rounded-full border border-border bg-muted/40 text-[11px] font-medium text-foreground/80">{d}</span>
          ))}
        </div>
      </div>

      {person.links && Object.keys(person.links).length > 0 && (
        <LinksSection links={person.links} />
      )}
    </div>
  );
};

const linkEntries: { key: keyof NonNullable<PersonProfile["links"]>; icon: typeof Github; label: string }[] = [
  { key: "github", icon: Github, label: "GitHub" },
  { key: "linkedin", icon: Linkedin, label: "LinkedIn" },
  { key: "portfolio", icon: Globe, label: "Portfolio" },
];

const LinksSection = ({ links }: { links: NonNullable<PersonProfile["links"]> }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (key: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(key);
    toast({ title: "Copied!", description: url });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Links</h3>
      <div className="space-y-2.5">
        {linkEntries.map(({ key, icon: Icon, label }) => {
          const url = links[key];
          if (!url) return null;
          return (
            <div key={key} className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/25 px-3 py-2.5">
              <Icon size={13} className="text-muted-foreground flex-shrink-0" />
              <span className="text-xs font-mono text-foreground/80 truncate flex-1">{url}</span>
              <button
                onClick={() => handleCopy(key, url)}
                className="flex-shrink-0 p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                title={`Copy ${label} URL`}
              >
                {copied === key ? <Check size={13} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileSidebar;
