import { FileText, Sparkles } from "lucide-react";
import type { PersonProfile } from "@/types/personProfile";

interface Props {
  person: PersonProfile;
}

const ReadmeAboutCard = ({ person }: Props) => (
  <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-[linear-gradient(180deg,hsl(var(--muted)/0.35),hsl(var(--card)))]">
      <div className="h-7 w-7 rounded-lg bg-primary/12 text-primary flex items-center justify-center">
        <FileText size={14} />
      </div>
      <span className="text-sm font-bold text-foreground">About Me</span>
      <span className="ml-auto px-2.5 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-[10px] font-semibold flex items-center gap-1">
        <Sparkles size={10} /> Public Intro
      </span>
    </div>

    <div className="p-5 sm:p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-2 tracking-tight">Professional Summary</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {person.bio || "No summary available yet."}
        </p>
      </div>

      {person.domainInterests.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Current Interests
          </h3>
          <ul className="grid sm:grid-cols-2 gap-2">
            {person.domainInterests.map((d) => (
              <li key={d} className="text-sm text-foreground/85 flex items-center gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Preferred Roles
        </h3>
        <div className="flex flex-wrap gap-2">
          {person.preferredRoles.map((r) => (
            <span key={r} className="px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold">{r}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ReadmeAboutCard;
