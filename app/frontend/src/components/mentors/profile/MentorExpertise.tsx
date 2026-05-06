import { Globe } from "lucide-react";
import type { Mentor } from "@/types/mentor";

const chipsOrFallback = (values: string[], chipClass: string, fallback: string) => {
  if (values.length === 0) {
    return <p className="text-sm text-muted-foreground">{fallback}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span key={value} className={chipClass}>
          {value}
        </span>
      ))}
    </div>
  );
};

const MentorExpertise = ({ mentor }: { mentor: Mentor }) => (
  <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
    <h2 className="text-lg font-bold text-foreground">Skills, Domains and Languages</h2>

    <div className="mt-5 space-y-5">
      <div className="space-y-2.5">
        <h3 className="text-sm font-semibold text-foreground">Expertise</h3>
        {chipsOrFallback(
          mentor.expertiseTags,
          "rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary",
          "No expertise tags added yet."
        )}
      </div>

      <div className="space-y-2.5">
        <h3 className="text-sm font-semibold text-foreground">Domains</h3>
        {chipsOrFallback(
          mentor.domainTags,
          "rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground",
          "No domain interests added yet."
        )}
      </div>

      <div className="space-y-2.5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Globe size={15} className="text-primary" />
          Languages
        </h3>
        {chipsOrFallback(
          mentor.languages,
          "rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground",
          "No language preferences shared yet."
        )}
      </div>
    </div>
  </section>
);

export default MentorExpertise;
