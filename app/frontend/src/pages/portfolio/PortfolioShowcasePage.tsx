import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ArrowLeft,
  ExternalLink,
  Lock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
  Layers3,
  Target,
  Sparkles,
  Wrench,
  NotebookPen,
  BarChart3,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { Separator } from "@/components/ui/separator";
import { fetchShowcaseById, type PortfolioShowcase } from "@/lib/portfolioStore";

const PortfolioShowcasePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showcase, setShowcase] = useState<PortfolioShowcase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/profile");
  };

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const item = await fetchShowcaseById(id);
        setShowcase(item);
      } catch (err: any) {
        setError(err?.message || "Unable to load showcase");
        setShowcase(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-12 text-center text-muted-foreground flex flex-col items-center gap-3">
          <Loader2 size={20} className="animate-spin" />
          <p>Loading showcase...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!showcase) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-12 text-center">
          <h1 className="text-2xl font-bold text-foreground">Showcase not found</h1>
          {error && <p className="text-sm text-muted-foreground mt-2">{error}</p>}
          <button type="button" onClick={handleBack} className="text-primary mt-4 inline-block hover:underline">Back to Profile</button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!showcase.isPublished) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-12">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Lock size={24} className="text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">This showcase is private</h1>
            <p className="mt-2 text-muted-foreground">The owner has not published this showcase yet.</p>
            <button type="button" onClick={handleBack} className="text-primary mt-4 inline-block hover:underline">Back to Profile</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const screenshots = showcase.screenshots || [];
  const heroSummary = showcase.summary || showcase.problem || showcase.solution || "Portfolio evidence with implementation details and outcomes.";
  const createdLabel = showcase.createdAt
    ? new Date(showcase.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;

  const metaItems = [
    { label: "Status", value: "Published" },
    createdLabel ? { label: "Published", value: createdLabel } : null,
    screenshots.length > 0 ? { label: "Screenshots", value: String(screenshots.length) } : null,
    showcase.techStack.length > 0 ? { label: "Technologies", value: String(showcase.techStack.length) } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const prevImg = () => setLightboxIdx(prev => prev !== null && prev > 0 ? prev - 1 : prev);
  const nextImg = () => setLightboxIdx(prev => prev !== null && prev < screenshots.length - 1 ? prev + 1 : prev);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-12">
        <Container>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5"
          >
            <ArrowLeft size={14} /> Back to Profile
          </button>

          <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-0">
              <div className="p-6 sm:p-8 space-y-5 bg-[linear-gradient(160deg,hsl(var(--card)),hsl(var(--muted)/0.3))]">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge className="rounded-full border border-primary/20 bg-primary/10 text-primary font-semibold px-3 py-1">
                    Published
                  </Badge>
                  {showcase.role && (
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium">Role: {showcase.role}</span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                  {showcase.title}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                  {heroSummary}
                </p>
                {showcase.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2.5">
                    {showcase.techStack.slice(0, 6).map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative min-h-[220px] lg:min-h-[100%] border-t lg:border-t-0 lg:border-l border-border bg-muted/30">
                {showcase.coverImage ? (
                  <>
                    <img src={showcase.coverImage} alt={showcase.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
                  </>
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.2),transparent_45%),radial-gradient(circle_at_80%_10%,hsl(var(--secondary)/0.15),transparent_40%),linear-gradient(120deg,hsl(var(--muted)),hsl(var(--background)))] flex items-center justify-center">
                    <div className="text-center px-6">
                      <Layers3 className="mx-auto h-7 w-7 text-primary/80" />
                      <p className="mt-2 text-xs text-muted-foreground font-medium">Showcase cover preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {metaItems.length > 0 && (
            <section className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {metaItems.map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-card px-3.5 py-3 shadow-sm">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{item.value}</p>
                </div>
              ))}
            </section>
          )}

          <section className="mt-8 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8 items-start">
            <div className="space-y-6 min-w-0">
              {showcase.summary && (
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-3 flex flex-row items-center gap-2.5 space-y-0">
                    <Sparkles size={15} className="text-primary" />
                    <CardTitle className="text-lg">Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-[15px] text-foreground/90 leading-relaxed">{showcase.summary}</p>
                  </CardContent>
                </Card>
              )}

              {(showcase.problem || showcase.solution) && (
                <div className="grid gap-4 lg:gap-5 md:grid-cols-2">
                  {showcase.problem && (
                    <Card className="border-border shadow-sm">
                      <CardHeader className="pb-3 flex flex-row items-center gap-2.5 space-y-0">
                        <Target size={15} className="text-primary" />
                        <CardTitle className="text-base">Problem</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-foreground/90 leading-relaxed">{showcase.problem}</p>
                      </CardContent>
                    </Card>
                  )}
                  {showcase.solution && (
                    <Card className="border-border shadow-sm">
                      <CardHeader className="pb-3 flex flex-row items-center gap-2.5 space-y-0">
                        <Sparkles size={15} className="text-primary" />
                        <CardTitle className="text-base">Solution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-foreground/90 leading-relaxed">{showcase.solution}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {showcase.responsibilities && (
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-3 flex flex-row items-center gap-2.5 space-y-0">
                    <NotebookPen size={15} className="text-primary" />
                    <CardTitle className="text-base">Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{showcase.responsibilities}</p>
                  </CardContent>
                </Card>
              )}

              {showcase.outcomes && (
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-3 flex flex-row items-center gap-2.5 space-y-0">
                    <BarChart3 size={15} className="text-primary" />
                    <CardTitle className="text-base">Outcomes & Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{showcase.outcomes}</p>
                  </CardContent>
                </Card>
              )}

              {screenshots.length > 0 && (
                <>
                  <Separator />
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-foreground">Screenshots</h3>
                      <span className="text-xs font-medium text-muted-foreground">{screenshots.length} evidence shot{screenshots.length > 1 ? "s" : ""}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {screenshots.map((ss, i) => (
                        <button
                          key={i}
                          onClick={() => setLightboxIdx(i)}
                          className="group rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <div className="aspect-video bg-muted overflow-hidden">
                            <img
                              src={ss}
                              alt={`Screenshot ${i + 1}`}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            />
                          </div>
                          <div className="px-3 py-2.5 text-left">
                            <p className="text-xs text-muted-foreground font-medium">Screenshot {i + 1}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>

            <aside className="space-y-4 xl:sticky xl:top-24 self-start">
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base">Quick Info</CardTitle></CardHeader>
                <CardContent className="space-y-2.5">
                  <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
                    <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Status</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">Published</p>
                  </div>
                  {showcase.role && (
                    <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
                      <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Role</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{showcase.role}</p>
                    </div>
                  )}
                  {createdLabel && (
                    <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
                      <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide flex items-center gap-1.5"><CalendarDays size={12} /> Published</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{createdLabel}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {showcase.techStack.length > 0 && (
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                    <Wrench size={15} className="text-primary" />
                    <CardTitle className="text-base">Tech Stack</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {showcase.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {showcase.links.length > 0 && (
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-3"><CardTitle className="text-base">Links</CardTitle></CardHeader>
                  <CardContent className="space-y-2.5">
                    {showcase.links.map((l, i) => (
                      <Button key={i} variant="outline" size="sm" className="w-full justify-start gap-1.5 text-xs" asChild>
                        <a href={l.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={12} /> {l.label || l.url}
                        </a>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {showcase.specialNotes && (
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-3"><CardTitle className="text-base">Notes</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{showcase.specialNotes}</p>
                  </CardContent>
                </Card>
              )}
            </aside>
          </section>
        </Container>
      </main>
      <Footer />

      {/* Lightbox */}
      <Dialog open={lightboxIdx !== null} onOpenChange={() => setLightboxIdx(null)}>
        <DialogContent className="max-w-4xl p-2 bg-background/95 backdrop-blur-sm border-border">
          {lightboxIdx !== null && screenshots[lightboxIdx] && (
            <div className="relative flex items-center justify-center">
              <img src={screenshots[lightboxIdx]} alt="" className="max-h-[80vh] w-auto rounded-lg object-contain" />
              {lightboxIdx > 0 && (
                <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background text-foreground card-shadow">
                  <ChevronLeft size={20} />
                </button>
              )}
              {lightboxIdx < screenshots.length - 1 && (
                <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background text-foreground card-shadow">
                  <ChevronRight size={20} />
                </button>
              )}
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
                {lightboxIdx + 1} / {screenshots.length}
              </span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioShowcasePage;
