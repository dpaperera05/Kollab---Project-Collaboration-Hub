import { useState } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, ExternalLink, Lock, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { getShowcaseById } from "@/lib/portfolioStore";

const PortfolioShowcasePage = () => {
  const { id } = useParams<{ id: string }>();
  const showcase = id ? getShowcaseById(id) : undefined;
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!showcase) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-12 text-center">
          <h1 className="text-2xl font-bold text-foreground">Showcase not found</h1>
          <Link to="/profile" className="text-primary mt-4 inline-block hover:underline">Back to Profile</Link>
        </main>
      </div>
    );
  }

  if (!showcase.isPublished) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Lock size={24} className="text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">This showcase is private</h1>
            <p className="mt-2 text-muted-foreground">The owner has not published this showcase yet.</p>
            <Link to="/profile" className="text-primary mt-4 inline-block hover:underline">Back to Profile</Link>
          </div>
        </main>
      </div>
    );
  }

  const screenshots = showcase.screenshots || [];

  const prevImg = () => setLightboxIdx(prev => prev !== null && prev > 0 ? prev - 1 : prev);
  const nextImg = () => setLightboxIdx(prev => prev !== null && prev < screenshots.length - 1 ? prev + 1 : prev);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        {/* Banner */}
        {showcase.coverImage && (
          <div className="w-full max-h-80 overflow-hidden bg-muted">
            <img src={showcase.coverImage} alt="" className="w-full h-80 object-cover" />
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
          <Link to="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-6 mb-6">
            <ArrowLeft size={14} /> Back to Profile
          </Link>

          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-foreground">{showcase.title}</h1>
                <Badge>Published</Badge>
              </div>
              {showcase.role && <p className="mt-1 text-muted-foreground">{showcase.role}</p>}
            </div>

            {/* Summary */}
            {showcase.summary && (
              <Card className="border-border card-shadow">
                <CardHeader className="pb-3"><CardTitle className="text-base">Summary</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-foreground/90 leading-relaxed">{showcase.summary}</p></CardContent>
              </Card>
            )}

            {/* Problem & Solution */}
            {(showcase.problem || showcase.solution) && (
              <div className="grid gap-6 sm:grid-cols-2">
                {showcase.problem && (
                  <Card className="border-border card-shadow">
                    <CardHeader className="pb-3"><CardTitle className="text-base">Problem</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-foreground/90 leading-relaxed">{showcase.problem}</p></CardContent>
                  </Card>
                )}
                {showcase.solution && (
                  <Card className="border-border card-shadow">
                    <CardHeader className="pb-3"><CardTitle className="text-base">Solution</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-foreground/90 leading-relaxed">{showcase.solution}</p></CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Responsibilities */}
            {showcase.responsibilities && (
              <Card className="border-border card-shadow">
                <CardHeader className="pb-3"><CardTitle className="text-base">Responsibilities</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{showcase.responsibilities}</p></CardContent>
              </Card>
            )}

            {/* Outcomes */}
            {showcase.outcomes && (
              <Card className="border-border card-shadow">
                <CardHeader className="pb-3"><CardTitle className="text-base">Outcomes & Metrics</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-foreground/90 leading-relaxed">{showcase.outcomes}</p></CardContent>
              </Card>
            )}

            {/* Screenshots Gallery */}
            {screenshots.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Screenshots</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {screenshots.map((ss, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxIdx(i)}
                      className="rounded-xl overflow-hidden border border-border card-shadow hover:card-shadow-hover transition-shadow aspect-video bg-muted"
                    >
                      <img src={ss} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {showcase.techStack.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {showcase.techStack.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                </div>
              </div>
            )}

            {/* Links */}
            {showcase.links.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Links</h3>
                <div className="flex flex-wrap gap-2">
                  {showcase.links.map((l, i) => (
                    <Button key={i} variant="outline" size="sm" className="gap-1 text-xs" asChild>
                      <a href={l.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} />{l.label || l.url}</a>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Special Notes */}
            {showcase.specialNotes && (
              <Card className="border-border card-shadow">
                <CardHeader className="pb-3"><CardTitle className="text-base">Notes</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-foreground/90 leading-relaxed">{showcase.specialNotes}</p></CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

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
