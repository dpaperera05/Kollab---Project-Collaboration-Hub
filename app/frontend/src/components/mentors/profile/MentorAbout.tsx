import type { Mentor } from "@/types/mentor";

const MentorAbout = ({ mentor }: { mentor: Mentor }) => (
  <div className="rounded-xl border border-border bg-card p-6 space-y-3">
    <h2 className="text-base font-bold text-foreground">About</h2>
    <p className="text-sm text-muted-foreground leading-relaxed">{mentor.bio}</p>
  </div>
);

export default MentorAbout;
