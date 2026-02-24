import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, X, ImageIcon, PenLine, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BLOG_DOMAIN_TAGS, BLOG_TOOLS_TAGS, BLOG_SKILLS_TAGS } from "@/data/blogTagOptions";
import { useToast } from "@/hooks/use-toast";

/* ── Tag group config ───────────────────────────────────── */

const TAG_GROUPS = [
  { label: "Domains", tags: BLOG_DOMAIN_TAGS },
  { label: "Tools & Tech", tags: BLOG_TOOLS_TAGS },
  { label: "Skills & Topics", tags: BLOG_SKILLS_TAGS },
];

/* ── Cover Upload ───────────────────────────────────────── */

const BlogCoverUpload = ({
  preview,
  onSelect,
  onRemove,
  error,
}: {
  preview: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  error?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSelect(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">Cover Image <span className="text-muted-foreground font-normal">(optional)</span></label>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleChange} />

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-border group">
          <img src={preview} alt="Cover preview" className="w-full h-48 sm:h-56 object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X size={14} />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-white/90 text-foreground text-xs font-medium hover:bg-white transition-colors shadow-sm"
          >
            Change
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "w-full h-48 sm:h-56 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors",
            error ? "border-destructive bg-destructive/5" : "border-border hover:border-primary/40 hover:bg-primary/[0.02]"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <ImageIcon size={22} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Click to upload cover image</p>
            <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, or WebP</p>
          </div>
        </button>
      )}
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  );
};

/* ── Tag Selector ───────────────────────────────────────── */

const BlogTagSelector = ({
  selected,
  onChange,
  error,
}: {
  selected: string[];
  onChange: (tags: string[]) => void;
  error?: string;
}) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>("Domains");

  const toggle = (tag: string) => {
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-foreground">
        Tags <span className="text-destructive">*</span>
      </label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20"
            >
              {tag}
              <button type="button" onClick={() => toggle(tag)} className="hover:text-primary/60 transition-colors">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Grouped tag picker */}
      <div className={cn("rounded-xl border p-3 space-y-1", error ? "border-destructive" : "border-border")}>
        {TAG_GROUPS.map((group) => {
          const isOpen = expandedGroup === group.label;
          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => setExpandedGroup(isOpen ? null : group.label)}
                className="flex items-center gap-2 w-full px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              >
                {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                {group.label}
                {group.tags.filter((t) => selected.includes(t)).length > 0 && (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {group.tags.filter((t) => selected.includes(t)).length}
                  </span>
                )}
              </button>
              {isOpen && (
                <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                  {group.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggle(tag)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                        selected.includes(tag)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-foreground hover:border-primary/50"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  );
};

/* ── Form State ─────────────────────────────────────────── */

interface FormState {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  coverFile: File | null;
  coverPreview: string | null;
}

interface FormErrors {
  title?: string;
  tags?: string;
  content?: string;
}

const INITIAL: FormState = {
  title: "",
  excerpt: "",
  content: "",
  tags: [],
  coverFile: null,
  coverPreview: null,
};

/* ── Page ───────────────────────────────────────────────── */

const CreateBlogPage = () => {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCoverSelect = (file: File) => {
    set("coverFile", file);
    set("coverPreview", URL.createObjectURL(file));
  };

  const handleCoverRemove = () => {
    if (form.coverPreview) URL.revokeObjectURL(form.coverPreview);
    set("coverFile", null);
    set("coverPreview", null);
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (form.tags.length === 0) e.tags = "Select at least one tag";
    if (!form.content.trim()) e.content = "Content is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePublish = () => {
    if (!validate()) return;
    setSubmitted(true);
    toast({
      title: "Blog published!",
      description: "Your blog has been published successfully (frontend demo).",
    });
  };

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20 pb-24 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md px-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles size={28} className="text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Blog Published!</h2>
              <p className="text-sm text-muted-foreground">
                Your blog "{form.title}" has been published to the Kollab community (frontend demo).
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/blogs"
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                View All Blogs
              </Link>
              <button
                onClick={() => { setSubmitted(false); setForm(INITIAL); setErrors({}); }}
                className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Write Another
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Form state ── */
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Header */}
        <div className="border-b border-border bg-card/50">
          <Container className="py-6 lg:py-8">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft size={14} />
              Back to Blogs
            </Link>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                  Write a <span className="gradient-text">Blog</span>
                </h1>
                <p className="text-sm text-muted-foreground max-w-lg">
                  Share insights, tutorials, project learnings, and experiences with the Kollab community.
                </p>
              </div>
              <Badge variant="outline" className="hidden sm:flex text-[10px] font-medium px-2.5 py-1 rounded-md flex-shrink-0">
                Frontend demo
              </Badge>
            </div>
          </Container>
        </div>

        {/* Form */}
        <Container className="py-8 lg:py-10">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-7 shadow-sm">

              {/* Cover image */}
              <BlogCoverUpload
                preview={form.coverPreview}
                onSelect={handleCoverSelect}
                onRemove={handleCoverRemove}
              />

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Give your blog a compelling title"
                  className={cn(
                    "w-full h-12 rounded-xl border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors",
                    errors.title ? "border-destructive" : "border-border"
                  )}
                />
                {errors.title && <p className="text-xs text-destructive font-medium">{errors.title}</p>}
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Excerpt / Short Summary <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                  placeholder="A brief summary that appears on the listing card (1–2 sentences)"
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Tags */}
              <BlogTagSelector
                selected={form.tags}
                onChange={(tags) => set("tags", tags)}
                error={errors.tags}
              />

              {/* Content */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Content <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => set("content", e.target.value)}
                  placeholder="Write your blog content here...&#10;&#10;Use blank lines to separate paragraphs. Write freely — formatting support will be enhanced in a future update."
                  rows={14}
                  className={cn(
                    "w-full rounded-xl border bg-background px-4 py-4 text-base text-foreground placeholder:text-muted-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-y min-h-[200px]",
                    errors.content ? "border-destructive" : "border-border"
                  )}
                />
                <div className="flex items-center justify-between">
                  {errors.content ? (
                    <p className="text-xs text-destructive font-medium">{errors.content}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Write in plain text. Paragraph breaks are preserved.</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {form.content.length > 0 ? `${form.content.split(/\s+/).filter(Boolean).length} words` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/blogs"
                className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handlePublish}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <PenLine size={15} />
                Publish
              </button>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default CreateBlogPage;
