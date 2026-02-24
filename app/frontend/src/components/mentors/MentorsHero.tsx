import Container from "@/components/ui/Container";
import MentorsSmartSearch from "./MentorsSmartSearch";
import MentorsHeroIllustration from "./MentorsHeroIllustration";

interface MentorsHeroProps {
  search: string;
  onSearchChange: (val: string) => void;
}

const MentorsHero = ({ search, onSearchChange }: MentorsHeroProps) => (
  <div className="border-b border-border bg-card/50 overflow-hidden">
    <Container className="py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8">
        <div className="flex-1 min-w-0 space-y-3.5">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              Find <span className="gradient-text">Mentors</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Get guidance from experienced mentors for projects and career growth.
            </p>
          </div>
          <MentorsSmartSearch value={search} onChange={onSearchChange} />
        </div>
        <div className="hidden md:flex flex-shrink-0 items-center justify-center lg:w-[380px] xl:w-[440px]">
          <MentorsHeroIllustration className="w-full" />
        </div>
      </div>
    </Container>
  </div>
);

export default MentorsHero;
