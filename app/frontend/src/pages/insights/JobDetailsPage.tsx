import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, ExternalLink, Building2, Briefcase } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import JobCard from "@/components/insights/JobCard";
import { getJobMarketJobById, getJobMarketJobs } from "@/services/jobMarketApi";
import type { Job } from "@/data/mockJobMarket";

// Role category label mappings
const ROLE_CATEGORY_LABELS: Record<string, string> = {
  devopscloud: "DevOps & Cloud Engineer",
  devopsandcloud: "DevOps & Cloud Engineer",
  dataai: "AI/ML Engineer",
  dataandai: "AI/ML Engineer",
  aianddata: "AI/ML Engineer",
  othertech: "Other Tech Jobs",
  otherengineering: "Other Tech Jobs",
  programmanagement: "Project Manager",
  frontend: "Front-End Development",
  frontenddev: "Front-End Development",
  frontenddeveloper: "Front-End Development",
  frontendengineer: "Front-End Development",
  frontendengineering: "Front-End Development",
  frontendweb: "Front-End Development",
  webfrontend: "Front-End Development",
  uiengineer: "Front-End Development",
  uideveloper: "Front-End Development",
  backend: "Back-End Development",
  backenddev: "Back-End Development",
  backenddeveloper: "Back-End Development",
  backendengineer: "Back-End Development",
  backendengineering: "Back-End Development",
  serverside: "Back-End Development",
  fullstack: "Full-Stack Development",
  fullstackdev: "Full-Stack Development",
  fullstackdeveloper: "Full-Stack Development",
  fullstackengineer: "Full-Stack Development",
  fullstackengineering: "Full-Stack Development",
  webdeveloper: "Full-Stack Development",
  webdevelopment: "Full-Stack Development",
  softwareengineer: "Full-Stack Development",
  softwaredeveloper: "Full-Stack Development",
  softwareengineering: "Software Engineer",
  softwaredevelopment: "Full-Stack Development",
  generalengineer: "Full-Stack Development",
  general: "Full-Stack Development",
  devops: "DevOps & Cloud Engineer",
  devopsengineer: "DevOps & Cloud Engineer",
  devopsengineering: "DevOps & Cloud Engineer",
  cloud: "DevOps & Cloud",
  cloudengineer: "DevOps & Cloud",
  cloudarchitect: "DevOps & Cloud",
  cloudengineering: "DevOps & Cloud",
  sre: "DevOps & Cloud",
  sitereliability: "DevOps & Cloud",
  sitereliabilityengineer: "DevOps & Cloud",
  platformengineer: "DevOps & Cloud",
  infrastructure: "DevOps & Cloud",
};

const toReadableLabel = (value: string) => {
  if (!value) return "Unknown";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeCategoryKey = (raw: string): string =>
  raw.toLowerCase().replace(/[\s_\-\/]+/g, "");

const labelForCategory = (raw: string): string =>
  ROLE_CATEGORY_LABELS[normalizeCategoryKey(raw)] ?? toReadableLabel(raw);

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [related, setRelated] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobDetails = async (jobId: string) => {
    try {
      setLoading(true);
      setError(null);

      const jobData = await getJobMarketJobById(jobId);
      setJob(jobData);

      if (jobData) {
        const relatedResult = await getJobMarketJobs({ roleCategory: jobData.roleCategory, limit: 4 });
        setRelated(relatedResult.jobs.filter((relatedJob) => relatedJob.id !== jobData.id).slice(0, 3));
      } else {
        setRelated([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load job details.");
      setJob(null);
      setRelated([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    void loadJobDetails(id);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20">
            <Container>
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-64 rounded-xl mb-6" />
            <Skeleton className="h-40 rounded-xl" />
          </Container>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    if (error) {
      return (
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="pt-24 pb-20">
            <Container className="text-center py-20">
              <h2 className="text-xl font-bold mb-2">Could not load job details</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => id && void loadJobDetails(id)}>Try again</Button>
            </Container>
          </div>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20">
          <Container className="text-center py-20">
            <h2 className="text-xl font-bold mb-2">Job not found</h2>
            <p className="text-muted-foreground mb-4">This job listing may have been removed.</p>
            <Button asChild><Link to="/insights/jobs">Back to Explorer</Link></Button>
          </Container>
        </div>
        <Footer />
      </div>
    );
  }

  const daysAgo = Math.max(0, Math.floor((Date.now() - new Date(job.postedDate).getTime()) / 86400000));
  const posted = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Optimized Hero Section */}
      <div className="pt-20 pb-6 border-b border-border/50 bg-gradient-to-br from-primary/[0.06] via-background to-primary/[0.03]">
        <Container>
          <Button variant="ghost" size="sm" className="gap-1.5 mb-5 -ml-2 hover:bg-primary/10 transition-colors" asChild>
            <Link to="/insights/jobs"><ArrowLeft size={14} /> Back to Explorer</Link>
          </Button>

          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
            <div className="space-y-4">
              {/* Title and Company */}
              <div className="flex gap-4 items-start">
                {job.companyLogo && (
                  <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl border-2 border-border/60 bg-card overflow-hidden shadow-sm">
                    <img 
                      src={job.companyLogo} 
                      alt={job.company}
                      className="w-full h-full object-contain p-2 md:p-3"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-foreground font-semibold mb-1">
                    <Building2 size={18} className="text-primary flex-shrink-0" />
                    <span className="text-lg">{job.company}</span>
                  </div>
                </div>
              </div>

              {/* Meta Info Row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="flex-shrink-0" />
                  <span>{job.location}, {job.country}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <Briefcase size={14} className="flex-shrink-0" />
                  <span>{job.workMode}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="flex-shrink-0" />
                  <span>{posted}</span>
                </div>
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold">{job.seniority}</Badge>
                <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold">{labelForCategory(job.roleCategory)}</Badge>
                <Badge variant="outline" className="px-3 py-1 text-xs">{job.employmentType}</Badge>
                {job.isTechJob && <Badge variant="default" className="px-3 py-1 text-xs bg-primary/90">Tech Role</Badge>}
              </div>
            </div>

            {/* Apply Button */}
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all px-8 h-11 whitespace-nowrap" asChild>
              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                Apply Now <ExternalLink size={16} />
              </a>
            </Button>
          </div>
        </Container>
      </div>

      <div className="py-10">
        <Container>
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            {/* Main Content Column */}
            <div className="space-y-6">
              {/* Full Description */}
              <Card className="p-6 md:p-8 border border-border/60 shadow-sm hover:border-border transition-colors">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-1 h-7 rounded-full bg-gradient-to-b from-primary to-primary/60" />
                  <h3 className="text-xl font-bold text-foreground">About This Position</h3>
                </div>
                <div className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert leading-relaxed space-y-3">
                  {job.description.split("\n").map((line, i) => (
                    <p key={i} className={`${line.startsWith("-") ? "pl-5 relative before:absolute before:left-0 before:content-['▪'] before:text-primary before:font-bold" : ""}`}>
                      {line.replace(/^-\s*/, "")}
                    </p>
                  ))}
                </div>
              </Card>

              {/* Skills & Technologies Combined */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Skills */}
                <Card className="p-5 md:p-6 border border-border/60 bg-gradient-to-br from-background to-muted/20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 rounded-full bg-primary" />
                    <h3 className="text-lg font-bold text-foreground">Required Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((s) => (
                      <Badge key={s} variant="secondary" className="text-sm px-3 py-1.5 font-medium hover:bg-secondary/80 transition-colors">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* Technologies */}
                <Card className="p-5 md:p-6 border border-border/60 bg-gradient-to-br from-background to-muted/20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 rounded-full bg-primary" />
                    <h3 className="text-lg font-bold text-foreground">Tech Stack</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.technologies.map((t) => (
                      <span key={t} className="px-3 py-1.5 text-sm font-semibold rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 hover:border-primary/30 transition-all">
                        {t}
                      </span>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:sticky lg:top-24 space-y-5 h-fit">
              {/* Apply Button - Mobile First */}
              <Button size="lg" className="w-full gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all h-12 text-base font-semibold" asChild>
                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                  Apply Now <ExternalLink size={18} />
                </a>
              </Button>

              {/* Job Details Card */}
              <Card className="p-5 border border-border/60 shadow-md">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
                  <div className="w-1 h-5 rounded-full bg-primary" />
                  <h4 className="font-bold text-foreground text-base">Job Information</h4>
                </div>
                <div className="space-y-3.5">
                  {[
                    { label: "Company", value: job.company, icon: Building2 },
                    { label: "Location", value: job.location, icon: MapPin },
                    { label: "Country", value: job.country, icon: MapPin },
                    { label: "Work Mode", value: job.workMode, icon: Briefcase },
                    { label: "Employment", value: job.employmentType, icon: Briefcase },
                    { label: "Posted", value: posted, icon: Clock },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Engagement Card */}
              <Card className="p-5 border-2 border-primary/20 bg-gradient-to-br from-primary/8 to-primary/3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <ExternalLink size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground mb-1">Ready to Apply?</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This role is actively hiring. Submit your application to get started with the hiring process.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Related Jobs */}
          {related.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border/50">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-1 h-7 rounded-full bg-gradient-to-b from-primary to-primary/50" />
                <h2 className="text-2xl font-bold text-foreground">Similar Opportunities</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map((rj) => (
                  <JobCard key={rj.id} job={rj} />
                ))}
              </div>
            </section>
          )}
        </Container>
      </div>

      <Footer />
    </div>
  );
};

export default JobDetailsPage;
