import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Eye, Pencil, Trash2, X, ImagePlus, Upload } from "lucide-react";
import { type KollabUser } from "@/lib/authStore";

// Lightweight in-file store so this component works even without a portfolioStore module.
export interface PortfolioShowcase {
  id: string;
  ownerId: string;
  title: string;
  role?: string;
  summary?: string;
  problem?: string;
  solution?: string;
  responsibilities?: string;
  outcomes?: string;
  techStack: string[];
  links: string[];
  coverImage?: string;
  screenshots: string[];
  collaborators: string[];
  specialNotes?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-memory only; replace with real backend when available.
const portfolioMemory: PortfolioShowcase[] = [];

const getShowcasesByOwner = (ownerId: string): PortfolioShowcase[] =>
  portfolioMemory.filter((s) => s.ownerId === ownerId);

const createShowcase = (
  input: Omit<PortfolioShowcase, "id" | "createdAt" | "updatedAt">
): PortfolioShowcase => {
  const now = new Date().toISOString();
  const showcase: PortfolioShowcase = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    techStack: input.techStack || [],
    links: input.links || [],
    screenshots: input.screenshots || [],
    collaborators: input.collaborators || [],
    ...input,
  };
  portfolioMemory.unshift(showcase);
  return showcase;
};

const updateShowcase = (
  id: string,
  changes: Partial<PortfolioShowcase>
): PortfolioShowcase | undefined => {
  const idx = portfolioMemory.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  const updated: PortfolioShowcase = {
    ...portfolioMemory[idx],
    ...changes,
    updatedAt: new Date().toISOString(),
  };
  portfolioMemory[idx] = updated;
  return updated;
};

const deleteShowcase = (id: string): void => {
  const idx = portfolioMemory.findIndex((s) => s.id === id);
  if (idx !== -1) portfolioMemory.splice(idx, 1);
};

interface Props { user: KollabUser; }

const EMPTY: Omit<PortfolioShowcase, "id" | "createdAt" | "updatedAt"> = {
  ownerId: "", title: "", role: "", summary: "", problem: "", solution: "",
  responsibilities: "", outcomes: "", techStack: [], links: [], coverImage: "",
  screenshots: [], collaborators: [], specialNotes: "", isPublished: false,
};

const PortfolioTab = ({ user }: Props) => {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => getShowcasesByOwner(user.id));
  const [editing, setEditing] = useState<Partial<PortfolioShowcase> | null>(null);
  const [techInput, setTechInput] = useState("");
  const bannerRef = useRef<HTMLInputElement>(null);
  const screenshotRef = useRef<HTMLInputElement>(null);

  const refresh = () => setItems(getShowcasesByOwner(user.id));

  const openNew = () => setEditing({ ...EMPTY, ownerId: user.id });
  const openEdit = (item: PortfolioShowcase) => setEditing({ ...item });

  const handleSave = () => {
    if (!editing?.title) { toast({ title: "Title is required", variant: "destructive" }); return; }
    if (editing.id) {
      updateShowcase(editing.id, editing);
      toast({ title: "Showcase updated" });
    } else {
      createShowcase(editing as any);
      toast({ title: "Showcase created" });
    }
    setEditing(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteShowcase(id);
    refresh();
    toast({ title: "Showcase deleted" });
  };

  const togglePublish = (item: PortfolioShowcase) => {
    updateShowcase(item.id, { isPublished: !item.isPublished });
    refresh();
    toast({ title: item.isPublished ? "Unpublished" : "Published" });
  };

  const addTech = (val: string) => {
    const v = val.trim();
    if (v && editing && !(editing.techStack || []).includes(v)) {
      setEditing({ ...editing, techStack: [...(editing.techStack || []), v] });
    }
    setTechInput("");
  };

  const set = (key: string, val: any) => setEditing(prev => prev ? { ...prev, [key]: val } : prev);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("coverImage", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const current = editing?.screenshots || [];
    if (current.length + files.length > 5) {
      toast({ title: "Maximum 5 screenshots", variant: "destructive" });
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setEditing(prev => {
          if (!prev) return prev;
          return { ...prev, screenshots: [...(prev.screenshots || []), reader.result as string] };
        });
      };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = "";
  };

  const removeScreenshot = (idx: number) => {
    setEditing(prev => {
      if (!prev) return prev;
      const ss = [...(prev.screenshots || [])];
      ss.splice(idx, 1);
      return { ...prev, screenshots: ss };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Portfolio Showcases</h3>
        <Button onClick={openNew} className="gap-2"><Plus size={16} /> New Showcase</Button>
      </div>

      {items.length === 0 ? (
        <Card className="border-border card-shadow">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No showcases yet. Create one to highlight your best work.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map(item => (
            <Card key={item.id} className="border-border card-shadow hover:card-shadow-hover transition-shadow overflow-hidden">
              {item.coverImage && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                  <Badge variant={item.isPublished ? "default" : "secondary"} className="text-xs shrink-0">
                    {item.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
                {item.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.techStack.slice(0, 4).map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                    {item.techStack.length > 4 && <Badge variant="outline" className="text-xs">+{item.techStack.length - 4}</Badge>}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => navigate(`/portfolio/${item.id}`)}><Eye size={12} /> View</Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => openEdit(item)}><Pencil size={12} /> Edit</Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => togglePublish(item)}>
                    {item.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 size={12} /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete showcase?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={!!editing} onOpenChange={open => { if (!open) setEditing(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Showcase" : "New Showcase"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 pt-2">
              {/* Banner Upload */}
              <div>
                <Label className="flex items-center gap-1.5 mb-2"><ImagePlus size={14} /> Project Banner / Cover Image</Label>
                <p className="text-xs text-muted-foreground mb-2">Recommended: 16:9 aspect ratio</p>
                {editing.coverImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img src={editing.coverImage} alt="" className="w-full aspect-video object-cover" />
                    <button onClick={() => set("coverImage", "")} className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background text-foreground"><X size={14} /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => bannerRef.current?.click()}
                    className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Upload size={24} />
                    <span className="text-xs">Click to upload banner</span>
                  </button>
                )}
                <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>Title *</Label><Input value={editing.title || ""} onChange={e => set("title", e.target.value)} /></div>
                <div><Label>Role</Label><Input value={editing.role || ""} onChange={e => set("role", e.target.value)} /></div>
              </div>
              <div><Label>Summary</Label><Textarea value={editing.summary || ""} onChange={e => set("summary", e.target.value)} rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Problem</Label><Textarea value={editing.problem || ""} onChange={e => set("problem", e.target.value)} rows={2} /></div>
                <div><Label>Solution</Label><Textarea value={editing.solution || ""} onChange={e => set("solution", e.target.value)} rows={2} /></div>
              </div>
              <div><Label>Responsibilities</Label><Textarea value={editing.responsibilities || ""} onChange={e => set("responsibilities", e.target.value)} rows={2} /></div>
              <div><Label>Outcomes / Metrics</Label><Textarea value={editing.outcomes || ""} onChange={e => set("outcomes", e.target.value)} rows={2} /></div>
              <div>
                <Label>Tech Stack</Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(editing.techStack || []).map(t => (
                    <Badge key={t} variant="secondary" className="gap-1 pr-1">{t}<button onClick={() => set("techStack", (editing.techStack || []).filter(x => x !== t))}><X size={10} /></button></Badge>
                  ))}
                </div>
                <Input value={techInput} onChange={e => setTechInput(e.target.value)} placeholder="Add tech tag..." onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTech(techInput); } }} />
              </div>

              {/* Screenshots Upload */}
              <div>
                <Label className="flex items-center gap-1.5 mb-2"><ImagePlus size={14} /> Screenshots (up to 5)</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
                  {(editing.screenshots || []).map((ss, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border border-border aspect-video bg-muted">
                      <img src={ss} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeScreenshot(i)} className="absolute top-1 right-1 p-0.5 rounded-full bg-background/80 hover:bg-background text-foreground"><X size={12} /></button>
                    </div>
                  ))}
                  {(editing.screenshots || []).length < 5 && (
                    <button
                      onClick={() => screenshotRef.current?.click()}
                      className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/40 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
                <input ref={screenshotRef} type="file" accept="image/*" multiple className="hidden" onChange={handleScreenshotUpload} />
              </div>

              <div><Label>Special Notes</Label><Textarea value={editing.specialNotes || ""} onChange={e => set("specialNotes", e.target.value)} rows={2} /></div>
              <div className="flex items-center gap-3">
                <Switch checked={editing.isPublished || false} onCheckedChange={v => set("isPublished", v)} />
                <span className="text-sm text-muted-foreground">{editing.isPublished ? "Published" : "Draft"}</span>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={handleSave}>Save Showcase</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioTab;
