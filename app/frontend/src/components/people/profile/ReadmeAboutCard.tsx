import { FileText, Sparkles } from "lucide-react";
import { PersonProfile } from "@/data/mockPeople";

interface Props {
  person: PersonProfile;
}

const ReadmeAboutCard = ({ person }: Props) => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    {/* Header bar */}
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
      <FileText size={14} className="text-primary" />
      <span className="text-sm font-bold text-foreground">About</span>
      <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center gap-1">
        <Sparkles size={10} /> Profile
      </span>
    </div>

    {/* Content */}
    <div className="p-5 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-2">About Me</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{person.bio}</p>
      </div>

      {person.domainInterests.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            🔭 Currently interested in
          </h3>
          <ul className="space-y-1">
            {person.domainInterests.map((d) => (
              <li key={d} className="text-sm text-foreground/80 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          💼 Looking for roles in
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {person.preferredRoles.map((r) => (
            <span key={r} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">{r}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ReadmeAboutCard;
