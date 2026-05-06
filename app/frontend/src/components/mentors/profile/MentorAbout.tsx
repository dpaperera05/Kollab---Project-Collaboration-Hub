import { ExternalLink, Github, Globe, Linkedin } from "lucide-react";
import type { Mentor } from "@/types/mentor";

const sanitizeExternalUrl = (url?: string): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const MentorAbout = ({ mentor }: { mentor: Mentor }) => {
  const links = [
    { key: "github", label: "GitHub", href: sanitizeExternalUrl(mentor.links?.github), icon: Github },
    { key: "linkedin", label: "LinkedIn", href: sanitizeExternalUrl(mentor.links?.linkedin), icon: Linkedin },
    { key: "portfolio", label: "Portfolio", href: sanitizeExternalUrl(mentor.links?.portfolio), icon: Globe },
  ].filter((item) => Boolean(item.href));

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
      <h2 className="text-lg font-bold text-foreground">About</h2>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">{mentor.bio}</p>

      {links.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground">Online Presence</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {links.map(({ key, label, href, icon: Icon }) => (
              <a
                key={key}
                href={href || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Icon size={13} className="text-primary" />
                {label}
                <ExternalLink size={11} className="text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default MentorAbout;
