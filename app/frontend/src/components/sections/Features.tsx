import {
  FolderOpen,
  UsersRound,
  CalendarCheck,
  FileText,
  Trophy,
  TrendingUp,
} from "lucide-react";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";

const features = [
  {
    icon: FolderOpen,
    title: "Discover Projects",
    description:
      "Filter by tech stack, role, or skill fit. Find projects that match your level and goals.",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    icon: UsersRound,
    title: "Find Teammates",
    description:
      "Browse student profiles with skill tags. Invite collaborators or join existing teams.",
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-950/30",
  },
  {
    icon: CalendarCheck,
    title: "Mentorship",
    description:
      "Book 1:1 sessions with verified mentors. Get feedback and guidance when you need it most.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: FileText,
    title: "Evidence Portfolio",
    description:
      "Verified project contributions become portfolio evidence. Export your resume instantly.",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
  },
  {
    icon: Trophy,
    title: "Job Simulations",
    description:
      "Auto-graded challenges modelled on real job tasks. Earn points and level up your career score.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    icon: TrendingUp,
    title: "Insights",
    description:
      "Explore job market trends and skill demand data. Know what to learn next.",
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-background">
      <Container>
        <SectionTitle
          label="Platform features"
          title="What you can do on "
          highlight="Kollab"
          description="Everything you need to go from student to job-ready professional — all in one place."
          className="mb-16"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 card-shadow hover:card-shadow-hover"
            >
              <div className={`mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl ${bg}`}>
                <Icon size={22} className={color} />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Features;
