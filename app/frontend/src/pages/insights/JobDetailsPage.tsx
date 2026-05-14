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
          <Container className="max-w-4xl">
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
            <Container className="max-w-4xl text-center py-20">
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
          <Container className="max-w-4xl text-center py-20">
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

      <div className="pt-20 pb-6 border-b border-border bg-gradient-to-b from-primary/[0.03] to-transparent">
        <Container className="max-w-4xl">
          <Button variant="ghost" size="sm" className="gap-1 mb-4 -ml-2" asChild>
            <Link to="/insights/jobs"><ArrowLeft size={14} /> Back to Explorer</Link>
          </Button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{job.title}</h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Building2 size={16} />
                <span className="font-medium text-foreground">{job.company}</span>
                <span>•</span>
                <MapPin size={14} />
                <span>{job.location}</span>
              </div>
            </div>
            <Button className="gap-2 self-start shrink-0" asChild>
              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                Apply Now <ExternalLink size={14} />
              </a>
            </Button>
          </div>
        </Container>
      </div>

      <div className="py-10">
        <Container className="max-w-4xl">
          <div className="grid lg:grid-cols-[1fr_280px] gap-8">
            {/* Main content */}
            <div className="space-y-8">
              {/* Meta badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{job.seniority}</Badge>
                <Badge variant="secondary">{labelForCategory(job.roleCategory)}</Badge>
                <Badge variant="outline">{job.workMode}</Badge>
                <Badge variant="outline">{job.employmentType}</Badge>
                {job.isTechJob && <Badge variant="outline" className="border-primary/30 text-primary">Tech Job</Badge>}
              </div>

              {/* Description */}
              <Card className="p-6 border">
                <h3 className="text-lg font-semibold text-foreground mb-4">About this role</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert">
                  {job.description.split("\n").map((line, i) => (
                    <p key={i} className={line.startsWith("-") ? "pl-4" : ""}>{line}</p>
                  ))}
                </div>
              </Card>

              {/* Skills */}
              <div>
                <h3 className="text-base font-semibold text-foreground mb-3">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <Badge key={s} variant="secondary" className="text-sm px-3 py-1">{s}</Badge>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div>
                <h3 className="text-base font-semibold text-foreground mb-3">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {job.technologies.map((t) => (
                    <span key={t} className="px-3 py-1 text-sm font-medium rounded-lg bg-primary/8 text-primary border border-primary/15">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="p-5 border space-y-4">
                <h4 className="font-semibold text-foreground">Job Details</h4>
                {[
                  { label: "Company", value: job.company, icon: Building2 },
                  { label: "Location", value: job.location, icon: MapPin },
                  { label: "Work Mode", value: job.workMode, icon: Briefcase },
                  { label: "Posted", value: posted, icon: Clock },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon size={14} className="text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium text-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </Card>

              <Button className="w-full gap-2" asChild>
                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                  Apply Now <ExternalLink size={14} />
                </a>
              </Button>
            </div>
          </div>

          {/* Related jobs */}
          {related.length > 0 && (
            <section className="mt-14">
              <h2 className="text-xl font-bold text-foreground mb-5">Related Jobs</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
