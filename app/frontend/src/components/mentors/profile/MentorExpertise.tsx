import { Globe } from "lucide-react";
import type { Mentor } from "@/types/mentor";

const MentorExpertise = ({ mentor }: { mentor: Mentor }) => (
  <div className="rounded-xl border border-border bg-card p-6 space-y-5">
    {/* Expertise */}
    <div className="space-y-2.5">
      <h2 className="text-base font-bold text-foreground">Expertise</h2>
      <div className="flex flex-wrap gap-2">
        {mentor.expertiseTags.map((tag) => (
          <span key={tag} className="rounded-full bg-primary-soft text-primary px-3 py-1 text-xs font-medium">
            {tag}
          </span>
        ))}
      </div>
    </div>

    {/* Domains */}
    <div className="space-y-2.5">
      <h2 className="text-base font-bold text-foreground">Domains</h2>
      <div className="flex flex-wrap gap-2">
        {mentor.domainTags.map((tag) => (
          <span key={tag} className="chip px-3 py-1 rounded-lg text-xs font-medium">
            {tag}
          </span>
        ))}
      </div>
    </div>

    {/* Languages */}
    <div className="space-y-2.5">
      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
        <Globe size={15} />
        Languages
      </h2>
      <div className="flex flex-wrap gap-2">
        {mentor.languages.map((lang) => (
          <span key={lang} className="px-3 py-1 rounded-lg text-xs font-medium border border-border bg-secondary text-secondary-foreground">
            {lang}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default MentorExpertise;
