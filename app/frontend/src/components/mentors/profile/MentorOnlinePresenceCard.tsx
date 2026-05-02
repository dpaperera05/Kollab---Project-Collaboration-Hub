import { ExternalLink, Github, Globe, Linkedin } from "lucide-react";
import type { Mentor } from "@/types/mentor";

type LinkItem = {
  key: "github" | "linkedin" | "portfolio";
  label: string;
  href?: string;
  Icon: typeof Github;
};

const sanitizeExternalUrl = (url?: string): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const MentorOnlinePresenceCard = ({ mentor }: { mentor: Mentor }) => {
  const items: LinkItem[] = [
    { key: "github", label: "GitHub", href: mentor.links?.github, Icon: Github },
    { key: "linkedin", label: "LinkedIn", href: mentor.links?.linkedin, Icon: Linkedin },
    { key: "portfolio", label: "Portfolio", href: mentor.links?.portfolio, Icon: Globe },
  ];

  const availableItems = items
    .map((item) => ({ ...item, href: sanitizeExternalUrl(item.href) }))
    .filter((item) => Boolean(item.href));

  if (availableItems.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">Online Presence</h3>
      </div>

      <div className="space-y-2.5">
        {availableItems.map(({ key, label, href, Icon }) => (
          <a
            key={key}
            href={href || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-xl border border-border bg-background/70 px-3.5 py-2.5 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <span className="flex items-center gap-2.5 text-foreground">
              <Icon size={15} className="text-primary" />
              <span className="font-medium">{label}</span>
            </span>
            <ExternalLink size={14} className="text-muted-foreground transition-colors group-hover:text-primary" />
          </a>
        ))}
      </div>
    </section>
  );
};

export default MentorOnlinePresenceCard;
