import { useState, useMemo, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, Upload, ImageIcon, Calendar, MapPin, Tag,
  FileText, Sparkles, ExternalLink, X, ChevronDown, ChevronUp,
} from "lucide-react";
import { format, differenceInDays, startOfToday } from "date-fns";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TimePicker from "@/components/ui/time-picker";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { EVENT_TYPES } from "@/data/eventOptions";
import { DOMAIN_TAGS, TOOLS_TECH_TAGS, SKILLS_TAGS, TIMEZONE_OPTIONS } from "@/data/eventTagOptions";
import { apiPost } from "@/lib/api";
import { getSession } from "@/lib/authStore";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface FormState {
  title: string;
  type: string;
  description: string;
  coverPreview: string | null;
  coverData: string | null;
  externalUrl: string;
  startDate: Date | undefined;
  startTime: string;
  endDate: Date | undefined;
  endTime: string;
  timezone: string;
  locationType: string;
  city: string;
  virtualPlatform: string;
  tags: string[];
  featured: boolean;
  organizer: string;
  prize: string;
  participantCount: string;
  notes: string;
}

const INITIAL: FormState = {
  title: "", type: "", description: "", coverPreview: null, coverData: null, externalUrl: "",
  startDate: undefined, startTime: "09:00", endDate: undefined, endTime: "17:00",
  timezone: "UTC", locationType: "", city: "", virtualPlatform: "",
  tags: [], featured: false, organizer: "", prize: "", participantCount: "", notes: "",
};

/* ------------------------------------------------------------------ */
/*  Tag chip                                                           */
/* ------------------------------------------------------------------ */
const TagChip = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
      selected
        ? "bg-primary text-primary-foreground border-primary shadow-sm"
        : "chip hover:border-primary/40 hover:bg-primary/5"
    )}
  >
    {label}
  </button>
);

/* ------------------------------------------------------------------ */
/*  Event Preview Card                                                 */
/* ------------------------------------------------------------------ */
const TYPE_COLORS: Record<string, string> = {
  Hackathon: "bg-primary/15 text-primary border-primary/25",
  Workshop: "bg-accent-foreground/5 text-accent-foreground border-accent-foreground/15",
  Talk: "bg-primary/10 text-primary border-primary/20",
  Webinar: "bg-primary/10 text-primary border-primary/20",
};

const EventPreviewCard = ({ form }: { form: FormState }) => {
  const daysLeft = form.startDate ? Math.max(0, differenceInDays(form.startDate, new Date())) : null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden card-shadow">
      {/* Cover */}
      <div className="aspect-[16/9] bg-muted relative flex items-center justify-center overflow-hidden">
        {form.coverPreview ? (
          <img src={form.coverPreview} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon size={28} />
            <span className="text-xs">Cover preview</span>
          </div>
        )}
        {form.type && (
          <Badge className={cn("absolute top-3 left-3 text-[10px]", TYPE_COLORS[form.type] || "chip")}>
            {form.type}
          </Badge>
        )}
        {daysLeft !== null && daysLeft > 0 && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold bg-background/80 backdrop-blur px-2 py-0.5 rounded-full text-foreground">
            ⏳ {daysLeft}d left
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <h4 className="font-bold text-sm text-foreground leading-snug line-clamp-2">
          {form.title || "Event Title"}
        </h4>

        {(form.startDate || form.locationType) && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {form.startDate && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {format(form.startDate, "MMM d, yyyy")}
                {form.startTime && ` · ${form.startTime}`}
              </span>
            )}
            {form.locationType && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {form.locationType === "City" ? form.city || "City" : "Virtual"}
              </span>
            )}
          </div>
        )}

        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {form.tags.slice(0, 4).map((t) => (
              <span key={t} className="chip text-[10px] px-2 py-0.5 rounded-full">{t}</span>
            ))}
            {form.tags.length > 4 && (
              <span className="text-[10px] text-muted-foreground">+{form.tags.length - 4}</span>
            )}
          </div>
        )}

        {form.externalUrl && (
          <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium">
            <ExternalLink size={10} /> Visit Event Site
          </span>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Hero Illustration (right side)                                     */
/* ------------------------------------------------------------------ */
const CreateEventIllustration = () => (
  <svg viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" aria-hidden="true">
    <defs>
      <radialGradient id="ce-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="hsl(270 80% 60%)" stopOpacity="0.15" />
        <stop offset="100%" stopColor="hsl(270 80% 60%)" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="180" cy="140" r="120" fill="url(#ce-glow)" />
    {/* Ticket card */}
    <rect x="110" y="70" width="140" height="90" rx="14" fill="hsl(270 80% 60%)" fillOpacity="0.08" stroke="hsl(270 80% 60%)" strokeWidth="1.2" strokeOpacity="0.3" />
    <rect x="110" y="70" width="140" height="28" rx="14" fill="hsl(270 80% 60%)" fillOpacity="0.12" />
    <circle cx="145" cy="84" r="4" fill="hsl(270 80% 60%)" fillOpacity="0.5" />
    <rect x="155" y="80" width="60" height="8" rx="4" fill="hsl(270 80% 60%)" fillOpacity="0.2" />
    <rect x="125" y="108" width="110" height="6" rx="3" fill="hsl(270 80% 60%)" fillOpacity="0.12" />
    <rect x="125" y="120" width="80" height="6" rx="3" fill="hsl(270 80% 60%)" fillOpacity="0.08" />
    <rect x="125" y="138" width="40" height="14" rx="7" fill="hsl(270 80% 60%)" fillOpacity="0.15" />
    <rect x="172" y="138" width="40" height="14" rx="7" fill="hsl(315 85% 65%)" fillOpacity="0.1" />
    {/* Floating elements */}
    <g>
      <rect x="60" y="180" width="50" height="20" rx="10" fill="hsl(270 80% 60%)" fillOpacity="0.1" stroke="hsl(270 80% 60%)" strokeWidth="0.7" strokeOpacity="0.25" />
      <text x="85" y="194" textAnchor="middle" fill="hsl(270 80% 60%)" fontSize="8" fontWeight="600" opacity="0.6">Create</text>
      <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="4s" repeatCount="indefinite" />
    </g>
    <g>
      <rect x="250" y="170" width="56" height="20" rx="10" fill="hsl(315 85% 65%)" fillOpacity="0.08" stroke="hsl(315 85% 65%)" strokeWidth="0.7" strokeOpacity="0.2" />
      <text x="278" y="184" textAnchor="middle" fill="hsl(315 85% 65%)" fontSize="8" fontWeight="600" opacity="0.5">Share</text>
      <animateTransform attributeName="transform" type="translate" values="0,0;0,3;0,0" dur="5s" repeatCount="indefinite" />
    </g>
    {/* Sparkle dots */}
    <circle cx="80" cy="100" r="3" fill="hsl(270 80% 60%)" fillOpacity="0.3">
      <animate attributeName="fillOpacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="280" cy="90" r="2.5" fill="hsl(315 85% 65%)" fillOpacity="0.25">
      <animate attributeName="fillOpacity" values="0.25;0.5;0.25" dur="4s" repeatCount="indefinite" />
    </circle>
    <circle cx="180" cy="220" r="60" fill="none" stroke="hsl(270 80% 60%)" strokeWidth="0.6" strokeOpacity="0.1">
      <animate attributeName="r" values="60;72;60" dur="5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Section Header                                                     */
/* ------------------------------------------------------------------ */
const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2.5 pb-4 border-b border-border mb-6">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
      <Icon size={16} className="text-primary" />
    </div>
    <h3 className="text-base font-bold text-foreground">{title}</h3>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
const CreateEventPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");

  const today = useMemo(() => startOfToday(), []);

  const formatInputDate = (d?: Date) => (d ? format(d, "yyyy-MM-dd") : "");
  const parseInputDate = (val: string) => (val ? new Date(`${val}T00:00:00`) : undefined);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const toggleTag = (tag: string) =>
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    set("coverPreview", objectUrl);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      set("coverData", result);
    };
    reader.readAsDataURL(file);
  };

  /* Validation */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.type) errs.type = "Event type is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.coverData) errs.cover = "Cover image is required";
    if (!form.externalUrl.trim()) errs.externalUrl = "Event URL is required";
    if (!form.startDate) errs.startDate = "Start date is required";
    if (!form.startTime) errs.startTime = "Start time is required";
    if (!form.timezone) errs.timezone = "Timezone is required";
    if (!form.locationType) errs.locationType = "Location type is required";
    if (form.locationType === "City" && !form.city.trim()) errs.city = "City is required for in-person events";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const session = getSession();
    if (!session) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const makeIso = (date?: Date, time?: string) => {
      if (!date || !time) return null;
      const dateStr = format(date, "yyyy-MM-dd");
      return new Date(`${dateStr}T${time}:00`).toISOString();
    };

    const startIso = makeIso(form.startDate, form.startTime);
    const endIso = makeIso(form.endDate, form.endTime);
    if (!startIso) {
      toast({ title: "Invalid date/time", description: "Start date/time is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    apiPost<{ success: boolean; data: { event: any } }>("/events", {
      title: form.title,
      type: form.type,
      description: form.description,
      coverImage: form.coverData,
      externalLink: form.externalUrl,
      dateTime: startIso,
      endDateTime: endIso || undefined,
      timezone: form.timezone,
      locationType: form.locationType,
      city: form.locationType === "City" ? form.city : undefined,
      virtualPlatform: form.locationType === "Virtual" ? form.virtualPlatform : undefined,
      tags: form.tags,
      featured: form.featured,
      organizer: form.organizer || undefined,
      prize: form.prize || undefined,
      participantCount: form.participantCount ? Number(form.participantCount) : undefined,
      notes: form.notes || undefined,
    })
      .then(() => {
        toast({ title: "🎉 Event created", description: "Your event is now live." });
        navigate("/events");
      })
      .catch((err: any) => {
        toast({
          title: "Failed to create event",
          description: err?.message || "Please try again",
          variant: "destructive",
        });
      })
      .finally(() => setIsSubmitting(false));
  };


  const FieldError = ({ name }: { name: string }) =>
    errors[name] ? <p className="text-xs text-destructive mt-1">{errors[name]}</p> : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <div className="border-b border-border bg-card/50">
          <Container className="py-6 lg:py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-10">
              <div className="flex-1 min-w-0 space-y-4">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Events
                </Link>
                <div className="space-y-2">
                  <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                    Create <span className="gradient-text">Event</span>
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                    Share hackathons, workshops, talks, and webinars with the Kollab community.
                  </p>
                </div>
                
              </div>
              <div className="hidden lg:flex flex-shrink-0 items-center justify-center w-[300px] xl:w-[340px]">
                <CreateEventIllustration />
              </div>
            </div>
          </Container>
        </div>

        {/* Content */}
        <Container className="py-8">
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 min-w-0 space-y-8">
              {/* Section A — Basic Info */}
              <div className="rounded-xl border border-border bg-card p-6 lg:p-8 card-shadow space-y-6">
                <SectionHeader icon={FileText} title="Basic Event Info" />

                <div className="grid gap-5">
                  <div>
                    <Label className="text-sm font-semibold">Event Title <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="e.g. AI Innovation Hackathon 2026"
                      value={form.title}
                      onChange={(e) => set("title", e.target.value)}
                      className="mt-1.5 h-11"
                    />
                    <FieldError name="title" />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Event Type <span className="text-destructive">*</span></Label>
                    <Select value={form.type} onValueChange={(v) => set("type", v)}>
                      <SelectTrigger className="mt-1.5 h-11">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError name="type" />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Short Description <span className="text-destructive">*</span></Label>
                    <Textarea
                      placeholder="Briefly describe the event..."
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      rows={3}
                      className="mt-1.5 resize-none"
                    />
                    <FieldError name="description" />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Cover Image <span className="text-destructive">*</span></Label>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleCover} />
                    {form.coverPreview ? (
                      <div className="mt-1.5 relative rounded-lg overflow-hidden border border-border">
                        <img src={form.coverPreview} alt="Cover" className="w-full aspect-[16/9] object-cover" />
                        <button
                          type="button"
                          onClick={() => { set("coverPreview", null); set("coverData", null); }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="mt-1.5 w-full aspect-[16/9] rounded-lg border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                      >
                        <Upload size={24} />
                        <span className="text-sm font-medium">Upload cover image</span>
                        <span className="text-xs">JPG, PNG, WebP · 16:9 recommended</span>
                      </button>
                    )}
                    <FieldError name="cover" />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">External Event URL <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="https://your-event-site.com"
                      value={form.externalUrl}
                      onChange={(e) => set("externalUrl", e.target.value)}
                      className="mt-1.5 h-11"
                    />
                    <FieldError name="externalUrl" />
                  </div>
                </div>
              </div>

              {/* Section B — Schedule & Location */}
              <div className="rounded-xl border border-border bg-card p-6 lg:p-8 card-shadow space-y-6">
                <SectionHeader icon={Calendar} title="Schedule & Location" />

                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Start Date */}
                  <div>
                    <Label className="text-sm font-semibold">Start Date <span className="text-destructive">*</span></Label>
                    <Input
                      type="date"
                      value={formatInputDate(form.startDate)}
                      onChange={(e) => set("startDate", parseInputDate(e.target.value))}
                      min={formatInputDate(today)}
                      className="mt-1.5 h-11"
                    />
                    <FieldError name="startDate" />
                  </div>

                  {/* Start Time */}
                  <div>
                    <Label className="text-sm font-semibold">Start Time <span className="text-destructive">*</span></Label>
                    <TimePicker value={form.startTime} onChange={(val) => set("startTime", val)} className="mt-1.5 h-11" />
                    <FieldError name="startTime" />
                  </div>

                  {/* End Date */}
                  <div>
                    <Label className="text-sm font-semibold">End Date</Label>
                    <Input
                      type="date"
                      value={formatInputDate(form.endDate)}
                      onChange={(e) => set("endDate", parseInputDate(e.target.value))}
                      min={formatInputDate(form.startDate || today)}
                      className="mt-1.5 h-11"
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <Label className="text-sm font-semibold">End Time</Label>
                    <TimePicker value={form.endTime} onChange={(val) => set("endTime", val)} className="mt-1.5 h-11" />
                  </div>

                  {/* Timezone */}
                  <div>
                    <Label className="text-sm font-semibold">Timezone <span className="text-destructive">*</span></Label>
                    <Select value={form.timezone} onValueChange={(v) => set("timezone", v)}>
                      <SelectTrigger className="mt-1.5 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONE_OPTIONS.map((tz) => (
                          <SelectItem key={tz} value={tz}>{tz.replace("_", " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError name="timezone" />
                  </div>

                  {/* Location Type */}
                  <div>
                    <Label className="text-sm font-semibold">Location Type <span className="text-destructive">*</span></Label>
                    <Select value={form.locationType} onValueChange={(v) => set("locationType", v)}>
                      <SelectTrigger className="mt-1.5 h-11">
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Virtual">Virtual</SelectItem>
                        <SelectItem value="City">In-person</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError name="locationType" />
                  </div>

                  {form.locationType === "City" && (
                    <div className="sm:col-span-2">
                      <Label className="text-sm font-semibold">City / Location <span className="text-destructive">*</span></Label>
                      <Input
                        placeholder="e.g. San Francisco, CA"
                        value={form.city}
                        onChange={(e) => set("city", e.target.value)}
                        className="mt-1.5 h-11"
                      />
                      <FieldError name="city" />
                    </div>
                  )}

                  {form.locationType === "Virtual" && (
                    <div className="sm:col-span-2">
                      <Label className="text-sm font-semibold">Virtual Platform</Label>
                      <Input
                        placeholder="e.g. Zoom, Discord, Google Meet"
                        value={form.virtualPlatform}
                        onChange={(e) => set("virtualPlatform", e.target.value)}
                        className="mt-1.5 h-11"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section C — Tags */}
              <div className="rounded-xl border border-border bg-card p-6 lg:p-8 card-shadow space-y-6">
                <SectionHeader icon={Tag} title="Tags & Discovery" />

                <div className="space-y-4">
                  <Input
                    placeholder="Search tags..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="h-10"
                  />

                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {form.tags.map((t) => (
                        <Badge key={t} variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => toggleTag(t)}>
                          {t} <X size={10} />
                        </Badge>
                      ))}
                    </div>
                  )}

                  {[{ label: "Domains", tags: DOMAIN_TAGS }, { label: "Tools & Tech", tags: TOOLS_TECH_TAGS }, { label: "Skills", tags: SKILLS_TAGS }].map(({ label, tags }) => {
                    const visible = tags.filter((t) => !tagSearch || t.toLowerCase().includes(tagSearch.toLowerCase()));
                    if (visible.length === 0) return null;
                    return (
                      <div key={label} className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {visible.map((t) => (
                            <TagChip key={t} label={t} selected={form.tags.includes(t)} onClick={() => toggleTag(t)} />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center gap-3 pt-2">
                    <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
                    <Label className="text-sm">Featured Event</Label>
                  </div>
                </div>
              </div>

              {/* Section D — Optional Extras (collapsible) */}
              <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExtrasOpen(!extrasOpen)}
                  className="w-full flex items-center justify-between p-6 lg:px-8 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                      <Sparkles size={16} className="text-primary" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">Optional Details</h3>
                  </div>
                  {extrasOpen ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                </button>
                {extrasOpen && (
                  <div className="px-6 lg:px-8 pb-6 pt-0 grid sm:grid-cols-2 gap-5">
                    <div>
                      <Label className="text-sm font-semibold">Organizer Name</Label>
                      <Input placeholder="Your name or org" value={form.organizer} onChange={(e) => set("organizer", e.target.value)} className="mt-1.5 h-11" />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Prize / Reward</Label>
                      <Input placeholder="e.g. $5,000 in prizes" value={form.prize} onChange={(e) => set("prize", e.target.value)} className="mt-1.5 h-11" />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Est. Participant Count</Label>
                      <Input type="number" placeholder="e.g. 200" value={form.participantCount} onChange={(e) => set("participantCount", e.target.value)} className="mt-1.5 h-11" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-sm font-semibold">Notes</Label>
                      <Textarea placeholder="Any additional notes..." value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className="mt-1.5 resize-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => navigate("/events")} className="h-11 px-6">
                  Cancel
                </Button>
                <Button type="submit" className="h-11 px-8" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </form>

            {/* Live Preview (desktop) */}
            <div className="hidden xl:block w-[320px] flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</p>
                <EventPreviewCard form={form} />
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default CreateEventPage;
