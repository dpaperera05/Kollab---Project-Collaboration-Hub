import { useEffect, useRef, useState } from "react";
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
import { Plus, Eye, Pencil, Trash2, X, ImagePlus, Upload, Loader2 } from "lucide-react";
import { type KollabUser } from "@/lib/authStore";
import {
  createShowcase,
  updateShowcase,
  deleteShowcase,
  fetchMyShowcases,
  type PortfolioShowcase,
  type PortfolioInput,
} from "@/lib/portfolioStore";

interface Props { user: KollabUser; }

const EMPTY: PortfolioInput = {
  title: "",
  role: "",
  summary: "",
  problem: "",
  solution: "",
  responsibilities: "",
  outcomes: "",
  techStack: [],
  links: [],
  coverImage: "",
  screenshots: [],
  collaborators: [],
  specialNotes: "",
  isPublished: false,
};

const TECH_OPTIONS = [
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "TypeScript",
  "JavaScript",
  "Python",
  "FastAPI",
  "Django",
  "Flask",
  "Go",
  "Java",
  "Spring Boot",
  "C#",
  ".NET",
  "C++",
  "Rust",
  "Swift",
  "Kotlin",
  "Flutter",
  "React Native",
  "Android",
  "iOS",
  "TailwindCSS",
  "CSS",
  "Sass",
  "GraphQL",
  "REST",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Prisma",
  "Supabase",
  "Firebase",
  "AWS",
  "GCP",
  "Azure",
  "Docker",
  "Kubernetes",
  "Terraform",
  "Ansible",
  "Kafka",
  "RabbitMQ",
  "MQTT",
  "OpenAI",
  "LangChain",
  "TensorFlow",
  "PyTorch",
  "Pandas",
  "NumPy",
  "Scikit-learn",
  "ROS2",
  "Arduino",
  "Raspberry Pi",
  "Three.js",
  "Unity",
  "Unreal",
  "Web3.js",
  "Solidity",
  "IPFS",
  "Stripe",
  "Auth0",
];

const PortfolioTab = ({ user }: Props) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<PortfolioShowcase[]>([]);
  const [editing, setEditing] = useState<Partial<PortfolioShowcase> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const bannerRef = useRef<HTMLInputElement>(null);
  const screenshotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadItems();
  }, [user.id]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await fetchMyShowcases();
      setItems(data);
    } catch (error: any) {
      toast({ title: "Could not load portfolio", description: error?.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setErrors({});
    setEditing({ ...EMPTY });
  };
  const openEdit = (item: PortfolioShowcase) => {
    setErrors({});
    setEditing({ ...item });
  };

  const isValidUrl = (val: string) => {
    if (!val) return false;
    try {
      const u = new URL(val);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const validate = (data: Partial<PortfolioShowcase>) => {
    const next: Partial<Record<string, string>> = {};
    if (!data.title?.trim()) next.title = "Title is required";
    if (!data.role?.trim()) next.role = "Role is required";
    if (!data.summary?.trim()) next.summary = "Summary is required";
    if (!data.problem?.trim()) next.problem = "Problem is required";
    if (!data.solution?.trim()) next.solution = "Solution is required";
    if (!data.responsibilities?.trim()) next.responsibilities = "Responsibilities are required";
    if (!data.outcomes?.trim()) next.outcomes = "Outcomes are required";
    if (!data.specialNotes?.trim()) next.specialNotes = "Notes are required";
    if (!data.coverImage) next.coverImage = "Cover image is required";
    if ((data.techStack || []).length === 0) next.techStack = "Add at least one tech";
    if ((data.techStack || []).length > 20) next.techStack = "Add up to 20 tech tags";
    if ((data.screenshots || []).length === 0) next.screenshots = "Add at least one screenshot";
    if ((data.screenshots || []).length > 5) next.screenshots = "Maximum 5 screenshots";
    if ((data.links || []).some((l: any) => !isValidUrl(l?.url))) next.links = "Links must be valid http/https URLs";
    return next;
  };

  const buildPayload = (data: Partial<PortfolioShowcase>): PortfolioInput => ({
    title: (data.title || "").trim(),
    role: data.role || "",
    summary: data.summary || "",
    problem: data.problem || "",
    solution: data.solution || "",
    responsibilities: data.responsibilities || "",
    outcomes: data.outcomes || "",
    techStack: data.techStack || [],
    links: data.links || [],
    coverImage: data.coverImage || "",
    screenshots: data.screenshots || [],
    collaborators: data.collaborators || [],
    specialNotes: data.specialNotes || "",
    isPublished: data.isPublished ?? false,
  });

  const handleSave = async () => {
    if (!editing) return;
    const validation = validate(editing);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      toast({ title: "Please fix the highlighted fields", variant: "destructive" });
      return;
    }

    const payload = buildPayload(editing);
    setSaving(true);
    try {
      if (editing.id) {
        await updateShowcase(editing.id, payload);
        toast({ title: "Showcase updated" });
      } else {
        await createShowcase(payload);
        toast({ title: "Showcase created" });
      }
      setEditing(null);
      await loadItems();
    } catch (error: any) {
      toast({ title: "Save failed", description: error?.message || "Unable to save showcase", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteShowcase(id);
      await loadItems();
      toast({ title: "Showcase deleted" });
    } catch (error: any) {
      toast({ title: "Delete failed", description: error?.message || "Unable to delete showcase", variant: "destructive" });
    }
  };

  const togglePublish = async (item: PortfolioShowcase) => {
    try {
      await updateShowcase(item.id, { isPublished: !item.isPublished });
      await loadItems();
      toast({ title: item.isPublished ? "Unpublished" : "Published" });
    } catch (error: any) {
      toast({ title: "Update failed", description: error?.message || "Unable to update publish state", variant: "destructive" });
    }
  };

  const toggleTech = (val: string) => {
    if (!editing) return;
    const list = editing.techStack || [];
    const exists = list.includes(val);
    const next = exists ? list.filter(t => t !== val) : [...list, val];
    set("techStack", next.slice(0, 20));
  };

  const set = (key: string, val: any) => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setEditing(prev => prev ? { ...prev, [key]: val } : prev);
  };

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
      setErrors(prev => ({ ...prev, screenshots: "Maximum 5 screenshots" }));
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

      {loading ? (
        <Card className="border-border card-shadow">
          <CardContent className="py-10 flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 size={16} className="animate-spin" />
            <span>Loading portfolio...</span>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs"
                    onClick={() => {
                      if (!item.id) {
                        toast({ title: "Missing showcase id", variant: "destructive" });
                        return;
                      }
                      navigate(`/portfolio/${item.id}`);
                    }}
                  >
                    <Eye size={12} /> View
                  </Button>
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

      <Dialog open={!!editing} onOpenChange={open => { if (!open) setEditing(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Showcase" : "New Showcase"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 pt-2">
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
                {errors.coverImage && <p className="text-xs text-destructive mt-1">{errors.coverImage}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={editing.title || ""} onChange={e => set("title", e.target.value)} />
                  {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
                </div>
                <div>
                  <Label>Role *</Label>
                  <Input value={editing.role || ""} onChange={e => set("role", e.target.value)} />
                  {errors.role && <p className="text-xs text-destructive mt-1">{errors.role}</p>}
                </div>
              </div>
              <div>
                <Label>Summary *</Label>
                <Textarea value={editing.summary || ""} onChange={e => set("summary", e.target.value)} rows={2} />
                {errors.summary && <p className="text-xs text-destructive mt-1">{errors.summary}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Problem *</Label>
                  <Textarea value={editing.problem || ""} onChange={e => set("problem", e.target.value)} rows={2} />
                  {errors.problem && <p className="text-xs text-destructive mt-1">{errors.problem}</p>}
                </div>
                <div>
                  <Label>Solution *</Label>
                  <Textarea value={editing.solution || ""} onChange={e => set("solution", e.target.value)} rows={2} />
                  {errors.solution && <p className="text-xs text-destructive mt-1">{errors.solution}</p>}
                </div>
              </div>
              <div>
                <Label>Responsibilities *</Label>
                <Textarea value={editing.responsibilities || ""} onChange={e => set("responsibilities", e.target.value)} rows={2} />
                {errors.responsibilities && <p className="text-xs text-destructive mt-1">{errors.responsibilities}</p>}
              </div>
              <div>
                <Label>Outcomes / Metrics *</Label>
                <Textarea value={editing.outcomes || ""} onChange={e => set("outcomes", e.target.value)} rows={2} />
                {errors.outcomes && <p className="text-xs text-destructive mt-1">{errors.outcomes}</p>}
              </div>
              <div>
                <Label>Tech Stack</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {TECH_OPTIONS.map((t) => {
                    const active = (editing.techStack || []).includes(t);
                    return (
                      <Button
                        key={t}
                        type="button"
                        size="sm"
                        variant={active ? "default" : "outline"}
                        className="text-[10px] h-6 px-2 leading-none"
                        onClick={() => toggleTech(t)}
                      >
                        {t}
                      </Button>
                    );
                  })}
                </div>
                {(editing.techStack || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {(editing.techStack || []).map(t => (
                      <Badge key={t} variant="secondary" className="text-[10px] gap-1 px-2 py-1 leading-none">
                        {t}
                        <button onClick={() => toggleTech(t)}><X size={10} /></button>
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.techStack && <p className="text-xs text-destructive mt-1">{errors.techStack}</p>}
              </div>

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
                {errors.screenshots && <p className="text-xs text-destructive mt-1">{errors.screenshots}</p>}
              </div>

              <div>
                <Label>Special Notes *</Label>
                <Textarea value={editing.specialNotes || ""} onChange={e => set("specialNotes", e.target.value)} rows={2} />
                {errors.specialNotes && <p className="text-xs text-destructive mt-1">{errors.specialNotes}</p>}
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={editing.isPublished || false} onCheckedChange={v => set("isPublished", v)} />
                <span className="text-sm text-muted-foreground">{editing.isPublished ? "Published" : "Draft"}</span>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Showcase"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioTab;
