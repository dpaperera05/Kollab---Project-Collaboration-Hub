import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, X, FileText } from "lucide-react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

type Blog = {
  _id: string;
  title: string;
  coverImage?: string;
  excerpt?: string;
  content?: string;
  createdAt: string;
};

const BlogsManagerTab = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Blog> | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiGet<{ success: boolean; data: { blogs: Blog[] } }>("/blogs")
      .then(res => setBlogs(res?.data?.blogs || []))
      .catch(() => toast({ title: "Failed to load blogs", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const openNew = () => setEditing({ _id: "", title: "", coverImage: "", excerpt: "", content: "", createdAt: new Date().toISOString() });
  const openEdit = (b: Blog) => setEditing({ ...b });

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditing(prev => prev ? { ...prev, coverImage: reader.result as string } : prev);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!editing?.title?.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    if (editing._id) {
      apiPut<{ success: boolean; data: { blog: Blog } }>(`/blogs/${editing._id}`, editing)
        .then(res => {
          const updated = res?.data?.blog;
          setBlogs(prev => prev.map(b => b._id === updated._id ? updated : b));
          toast({ title: "Blog updated" });
        })
        .catch(() => toast({ title: "Failed to update blog", variant: "destructive" }))
        .finally(() => setEditing(null));
    } else {
      apiPost<{ success: boolean; data: { blog: Blog } }>("/blogs", editing)
        .then(res => {
          const created = res?.data?.blog;
          setBlogs(prev => [created, ...prev]);
          toast({ title: "Blog created" });
        })
        .catch(() => toast({ title: "Failed to create blog", variant: "destructive" }))
        .finally(() => setEditing(null));
    }
  };

  const deleteBlog = (id: string) => {
    apiDelete(`/blogs/${id}`)
      .then(() => {
        setBlogs(prev => prev.filter(b => b._id !== id));
        toast({ title: "Blog deleted" });
      })
      .catch(() => toast({ title: "Failed to delete blog", variant: "destructive" }));
  };

  const set = (key: string, val: string) => setEditing(prev => prev ? { ...prev, [key]: val } : prev);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">My Blogs</h3>
        <Button onClick={openNew} className="gap-2"><Plus size={16} /> New Blog</Button>
      </div>

        {loading ? (
          <Card className="border-border card-shadow"><CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent></Card>
        ) : blogs.length === 0 ? (
        <Card className="border-border card-shadow"><CardContent className="py-12 text-center text-muted-foreground">
          <FileText size={32} className="mx-auto mb-3 opacity-50" /><p>No blogs yet. Write your first post!</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {blogs.map(b => (
            <Card key={b._id} className="border-border card-shadow overflow-hidden">
              {b.coverImage && <div className="aspect-video bg-muted overflow-hidden"><img src={b.coverImage} alt="" className="w-full h-full object-cover" /></div>}
              <CardContent className="p-5 space-y-2">
                <h4 className="font-semibold text-foreground">{b.title}</h4>
                <p className="text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{b.excerpt}</p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => openEdit(b)}><Pencil size={12} /> Edit</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 size={12} /> Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete blog?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteBlog(b._id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
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
          <DialogHeader><DialogTitle>{editing?._id ? "Edit Blog" : "New Blog"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 pt-2">
              <div><Label>Title *</Label><Input value={editing.title || ""} onChange={e => set("title", e.target.value)} placeholder="Blog title..." /></div>
              <div>
                <Label className="mb-2 block">Cover Image</Label>
                {editing.coverImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img src={editing.coverImage} alt="" className="w-full aspect-video object-cover" />
                    <button onClick={() => set("coverImage", "")} className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"><X size={14} /></button>
                  </div>
                ) : (
                  <button onClick={() => coverRef.current?.click()} className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Upload size={24} /><span className="text-xs">Upload cover image</span>
                  </button>
                )}
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCover} />
              </div>
              <div><Label>Excerpt</Label><Input value={editing.excerpt || ""} onChange={e => set("excerpt", e.target.value)} placeholder="Short summary..." /></div>
              <div>
                <Label>Content (Markdown supported)</Label>
                <Textarea value={editing.content || ""} onChange={e => set("content", e.target.value)} rows={10} placeholder="Write your blog content here..." className="font-mono text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={handleSave}>Save Blog</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogsManagerTab;
