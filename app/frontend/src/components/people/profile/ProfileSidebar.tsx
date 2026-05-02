import { useNavigate } from "react-router-dom";
import { Briefcase, Layers, MessageCircle, Clock, Github, Linkedin, Globe, Copy, Check } from "lucide-react";
import type { PersonProfile } from "@/types/personProfile";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Props {
  person: PersonProfile;
}

const ProfileSidebar = ({ person }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      {/* Avatar */}
      <div className="flex flex-col items-center lg:items-start gap-4">
        <img
          src={person.avatar}
          alt={person.name}
          className="w-48 h-48 lg:w-full lg:h-auto lg:max-w-[280px] rounded-2xl border-2 border-border bg-muted shadow-lg"
        />
        <div className="text-center lg:text-left space-y-1">
          <h1 className="text-2xl font-extrabold text-foreground">{person.name}</h1>
          {person.headline && (
            <p className="text-sm text-muted-foreground leading-relaxed">{person.headline}</p>
          )}
        </div>
      </div>

      {/* Message button */}
      <button
        onClick={() => navigate("/messages")}
        className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors"
      >
        <MessageCircle size={15} className="text-primary" />
        Message
      </button>

      {/* Roles */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Roles</h3>
        <div className="flex flex-wrap gap-1.5">
          {person.preferredRoles.map((r) => (
            <span key={r} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stats</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
            <Briefcase size={14} className="text-primary" />
            <div>
              <p className="text-lg font-bold text-foreground leading-none">{person.stats.projectsCount}</p>
              <p className="text-[10px] text-muted-foreground">Projects</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
            <Layers size={14} className="text-primary" />
            <div>
              <p className="text-lg font-bold text-foreground leading-none">{person.stats.showcasesCount}</p>
              <p className="text-[10px] text-muted-foreground">Showcases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock size={14} />
        <span>{person.availabilityHoursPerWeek} hrs/week available</span>
      </div>

      {/* Domains */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interests</h3>
        <div className="flex flex-wrap gap-1.5">
          {person.domainInterests.map((d) => (
            <span key={d} className="chip px-2 py-0.5 rounded-md text-[11px] font-medium">{d}</span>
          ))}
        </div>
      </div>

      {/* Links */}
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
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Links</h3>
      <div className="space-y-2">
        {linkEntries.map(({ key, icon: Icon, label }) => {
          const url = links[key];
          if (!url) return null;
          return (
            <div key={key} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
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
