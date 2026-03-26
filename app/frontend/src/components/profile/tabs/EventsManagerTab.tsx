import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, X, Calendar, MapPin, ExternalLink, Clock } from "lucide-react";
import { EVENT_TAG_OPTIONS } from "@/data/mockProfileContent";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

type Event = {
  _id: string;
  title: string;
  coverImage?: string;
  type: "Hackathon" | "Talk" | "Workshop" | "Webinar";
  dateTime: string;
  location: string;
  tags: string[];
  externalLink?: string;
  description?: string;
};

const EVENT_TYPES = ["Hackathon", "Talk", "Workshop", "Webinar"] as const;

const TYPE_COLORS: Record<string, string> = {
  Hackathon: "bg-primary/10 text-primary border-primary/20",
  Talk: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  Workshop: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Webinar: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
};

const EventsManagerTab = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Event> | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiGet<{ success: boolean; data: { events: Event[] } }>("/events")
      .then(res => setEvents(res?.data?.events || []))
      .catch(() => toast({ title: "Failed to load events", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const openNew = () => setEditing({ _id: "", title: "", coverImage: "", type: "Talk", dateTime: "", location: "Virtual", tags: [], externalLink: "", description: "" });
  const openEdit = (e: Event) => setEditing({ ...e });

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
      apiPut<{ success: boolean; data: { event: Event } }>(`/events/${editing._id}`, editing)
        .then(res => {
          const updated = res?.data?.event;
          setEvents(prev => prev.map(ev => ev._id === updated._id ? updated : ev));
          toast({ title: "Event updated" });
        })
        .catch(() => toast({ title: "Failed to update event", variant: "destructive" }))
        .finally(() => setEditing(null));
    } else {
      apiPost<{ success: boolean; data: { event: Event } }>("/events", editing)
        .then(res => {
          const created = res?.data?.event;
          setEvents(prev => [created, ...prev]);
          toast({ title: "Event created" });
        })
        .catch(() => toast({ title: "Failed to create event", variant: "destructive" }))
        .finally(() => setEditing(null));
    }
  };

  const deleteEvent = (id: string) => {
    apiDelete(`/events/${id}`)
      .then(() => {
        setEvents(prev => prev.filter(e => e._id !== id));
        toast({ title: "Event deleted" });
      })
      .catch(() => toast({ title: "Failed to delete event", variant: "destructive" }));
  };

  const set = (key: string, val: any) => setEditing(prev => prev ? { ...prev, [key]: val } : prev);

  const toggleTag = (tag: string) => {
    setEditing(prev => {
      if (!prev) return prev;
      const tags = prev.tags || [];
      return { ...prev, tags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag] };
    });
  };

  const daysLeft = (dt: string) => {
    const diff = Math.ceil((new Date(dt).getTime() - Date.now()) / 86400000);
    return diff > 0 ? diff : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">My Events</h3>
        <Button onClick={openNew} className="gap-2"><Plus size={16} /> New Event</Button>
      </div>

      {loading ? (
        <Card className="border-border card-shadow"><CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent></Card>
      ) : events.length === 0 ? (
        <Card className="border-border card-shadow"><CardContent className="py-12 text-center text-muted-foreground">
          <Calendar size={32} className="mx-auto mb-3 opacity-50" /><p>No events created yet.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map(ev => {
            const dl = daysLeft(ev.dateTime);
            return (
              <Card key={ev._id} className="border-border card-shadow overflow-hidden">
                {ev.coverImage && <div className="aspect-video bg-muted overflow-hidden"><img src={ev.coverImage} alt="" className="w-full h-full object-cover" /></div>}
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-foreground">{ev.title}</h4>
                    <Badge variant="outline" className={TYPE_COLORS[ev.type]}>{ev.type}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar size={10} />{new Date(ev.dateTime).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={10} />{new Date(ev.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="flex items-center gap-1"><MapPin size={10} />{ev.location}</span>
                    {dl && <span className="text-primary font-medium">⏳ {dl} days left</span>}
                  </div>
                  {ev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">{ev.tags.slice(0, 4).map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div>
                  )}
                  {ev.externalLink && <a href={ev.externalLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1"><ExternalLink size={10} /> Event Link</a>}
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => openEdit(ev)}><Pencil size={12} /> Edit</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 size={12} /> Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete event?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteEvent(ev._id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={!!editing} onOpenChange={open => { if (!open) setEditing(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?._id ? "Edit Event" : "New Event"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 pt-2">
              <div><Label>Title *</Label><Input value={editing.title || ""} onChange={e => set("title", e.target.value)} /></div>
              <div>
                <Label className="mb-2 block">Cover Image</Label>
                {editing.coverImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img src={editing.coverImage} alt="" className="w-full aspect-video object-cover" />
                    <button onClick={() => set("coverImage", "")} className="absolute top-2 right-2 p-1 rounded-full bg-background/80"><X size={14} /></button>
                  </div>
                ) : (
                  <button onClick={() => coverRef.current?.click()} className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Upload size={24} /><span className="text-xs">Upload cover</span>
                  </button>
                )}
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCover} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={editing.type || "Talk"} onValueChange={v => set("type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Location</Label><Input value={editing.location || ""} onChange={e => set("location", e.target.value)} placeholder="Virtual or City" /></div>
              </div>
              <div>
                <Label>Date & Time (UTC)</Label>
                <Input type="datetime-local" value={editing.dateTime ? editing.dateTime.slice(0, 16) : ""} onChange={e => set("dateTime", e.target.value + ":00Z")} />
                {editing.dateTime && <p className="text-xs text-muted-foreground mt-1">Local: {new Date(editing.dateTime).toLocaleString()}</p>}
              </div>
              <div><Label>External Link</Label><Input value={editing.externalLink || ""} onChange={e => set("externalLink", e.target.value)} placeholder="https://..." /></div>
              <div>
                <Label className="mb-2 block">Tags</Label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {EVENT_TAG_OPTIONS.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${(editing.tags || []).includes(tag) ? "bg-primary/10 text-primary border-primary" : "chip hover:border-primary/30"}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div><Label>Description</Label><Textarea value={editing.description || ""} onChange={e => set("description", e.target.value)} rows={4} /></div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={handleSave}>Save Event</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsManagerTab;
