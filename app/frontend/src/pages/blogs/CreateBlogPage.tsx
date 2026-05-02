import { useState, useRef, type ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { X, ImageIcon, PenLine, ChevronDown, ChevronRight, Eye, Edit3, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { BLOG_DOMAIN_TAGS, BLOG_TOOLS_TAGS, BLOG_SKILLS_TAGS } from "@/data/blogTagOptions";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/lib/api";
import { getSession } from "@/lib/authStore";

/* ── Tag group config ───────────────────────────────────── */

const TAG_GROUPS = [
  { label: "Domains", tags: BLOG_DOMAIN_TAGS },
  { label: "Tools & Tech", tags: BLOG_TOOLS_TAGS },
  { label: "Skills & Topics", tags: BLOG_SKILLS_TAGS },
];

const renderInlineCode = (text: string) => {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code key={`inline-${idx}`} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={`txt-${idx}`}>{part}</span>;
  });
};

const ContentPreview = ({ content }: { content: string }) => {
  if (!content.trim()) {
    return <p className="text-sm text-muted-foreground">Preview will appear here as you write.</p>;
  }

  const lines = content.split("\n");
  const nodes: ReactNode[] = [];
  let i = 0;
  let inCode = false;
  let codeLines: string[] = [];

  while (i < lines.length) {
    const raw = lines[i] ?? "";
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        nodes.push(
          <pre key={`code-${i}`} className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-4">
            <code className="font-mono text-sm text-foreground">{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      i += 1;
      continue;
    }

    if (inCode) {
      codeLines.push(raw);
      i += 1;
      continue;
    }

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      nodes.push(
        <h3 key={`h3-${i}`} className="text-xl font-bold text-foreground">
          {renderInlineCode(trimmed.slice(4))}
        </h3>
      );
      i += 1;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      nodes.push(
        <h2 key={`h2-${i}`} className="text-2xl font-extrabold text-foreground">
          {renderInlineCode(trimmed.slice(3))}
        </h2>
      );
      i += 1;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      nodes.push(
        <h1 key={`h1-${i}`} className="text-3xl font-extrabold text-foreground">
          {renderInlineCode(trimmed.slice(2))}
        </h1>
      );
      i += 1;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      nodes.push(
        <blockquote key={`q-${i}`} className="border-l-4 border-primary/40 bg-primary/5 px-4 py-3 text-sm italic text-foreground/90 rounded-r-lg">
          {renderInlineCode(trimmed.slice(2))}
        </blockquote>
      );
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test((lines[i] ?? "").trim())) {
        items.push((lines[i] ?? "").trim().replace(/^[-*]\s+/, ""));
        i += 1;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="list-disc pl-6 space-y-2 text-foreground/90">
          {items.map((item, idx) => (
            <li key={`li-${i}-${idx}`}>{renderInlineCode(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    const paragraphLines = [trimmed];
    let j = i + 1;
    while (j < lines.length) {
      const next = (lines[j] ?? "").trim();
      if (!next || next.startsWith("#") || next.startsWith("> ") || /^[-*]\s+/.test(next) || next.startsWith("```")) break;
      paragraphLines.push(next);
      j += 1;
    }

    nodes.push(
      <p key={`p-${i}`} className="text-base leading-8 text-foreground/90">
        {renderInlineCode(paragraphLines.join(" "))}
      </p>
    );
    i = j;
  }

  return <div className="space-y-5">{nodes}</div>;
};

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
  coverData: string | null;
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
  coverData: null,
};

/* ── Page ───────────────────────────────────────────────── */

const CreateBlogPage = () => {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCoverSelect = (file: File) => {
    set("coverFile", file);
    set("coverPreview", URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = () => set("coverData", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCoverRemove = () => {
    if (form.coverPreview) URL.revokeObjectURL(form.coverPreview);
    set("coverFile", null);
    set("coverPreview", null);
    set("coverData", null);
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (form.tags.length === 0) e.tags = "Select at least one tag";
    if (!form.content.trim()) e.content = "Content is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePublish = async () => {
    if (!validate()) return;

    const session = getSession();
    if (!session?.token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost("/blogs", {
        title: form.title,
        excerpt: form.excerpt || undefined,
        content: form.content,
        tags: form.tags,
        coverImage: form.coverData || undefined,
      });

      toast({ title: "Blog published!", description: "Your blog is now live." });
      navigate("/blogs");
    } catch (error: any) {
      toast({ title: "Failed to publish", description: error?.message || "Please try again", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertSnippet = (snippet: string) => {
    const textarea = contentRef.current;

    if (!textarea) {
      set("content", `${form.content}${snippet}`);
      return;
    }

    const start = textarea.selectionStart ?? form.content.length;
    const end = textarea.selectionEnd ?? form.content.length;

    const before = form.content.slice(0, start);
    const after = form.content.slice(end);
    const next = `${before}${snippet}${after}`;
    set("content", next);

    const cursorPos = start + snippet.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const ARTICLE_TEMPLATE =
    "## Why This Matters\n\n" +
    "Explain the context and why this topic is important.\n\n" +
    "> Add a short insight or lesson learned here.\n\n" +
    "## Key Lessons\n\n" +
    "- First key point\n" +
    "- Second key point\n" +
    "- Third key point\n\n" +
    "## Practical Tips\n\n" +
    "- Add a practical tip\n" +
    "- Add another practical tip\n" +
    "- Add a final recommendation\n\n" +
    "## Final Thoughts\n\n" +
    "Summarize what readers should take away.";

  const applyTemplate = () => {
    if (form.content.trim()) {
      toast({ title: "Template only works on empty content", description: "Clear content first if you want to apply the full article template." });
      return;
    }
    set("content", ARTICLE_TEMPLATE);
    requestAnimationFrame(() => contentRef.current?.focus());
  };

  /* ── Form state ── */
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-border">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--primary) / 0.10) 0%, hsl(var(--accent-brand) / 0.05) 50%, transparent 100%)",
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: "-60px",
              left: "-80px",
              width: "340px",
              height: "340px",
              borderRadius: "50%",
              background: "radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: "20px",
              right: "-60px",
              width: "260px",
              height: "260px",
              borderRadius: "50%",
              background: "radial-gradient(circle, hsl(var(--accent-brand) / 0.07), transparent 70%)",
              filter: "blur(50px)",
            }}
          />

          <div className="relative max-w-4xl mx-auto px-6 pt-14 pb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              New Blog
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-3">
              Write a <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
              Publish clear, practical articles for the Kollab community using concise and readable storytelling.
            </p>
          </div>
        </div>

        {/* Form */}
        <Container className="py-8 lg:py-12">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-sm p-6 sm:p-8 space-y-7 shadow-sm">

              {/* Cover image */}
              <BlogCoverUpload
                preview={form.coverPreview}
                onSelect={handleCoverSelect}
                onRemove={handleCoverRemove}
              />
              <p className="text-xs text-muted-foreground -mt-2">Recommended cover ratio: 16:9 (at least 1200x675).</p>

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
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <label className="text-sm font-semibold text-foreground">
                    Content <span className="text-destructive">*</span>
                  </label>
                  <div className="inline-flex rounded-lg border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setEditorMode("write")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors",
                        editorMode === "write" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Edit3 size={12} /> Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode("preview")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border-l border-border",
                        editorMode === "preview" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Eye size={12} /> Preview
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/35 p-3 sm:p-4 space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-foreground">
                    Use simple formatting to structure your article: headings, lists, quotes, and code.
                  </p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground font-mono break-all">
                    ## Section heading | ### Smaller heading | &gt; Highlighted quote | - Bullet point | ```code block```
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => insertSnippet("\n\n## Section heading\n\nWrite your section here.")}
                    className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    Heading
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet("\n\n### Subheading\n\nWrite your details here.")}
                    className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    Subheading
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet("\n\n> Add an important insight or quote here.\n")}
                    className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet("\n\n- First point\n- Second point\n- Third point\n")}
                    className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    Bullet List
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet("\n\n```\n// Add code here\n```\n")}
                    className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    Code Block
                  </button>
                  <button
                    type="button"
                    onClick={applyTemplate}
                    className="px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/15 transition-colors"
                  >
                    Use article template
                  </button>
                </div>

                {editorMode === "write" ? (
                  <textarea
                    ref={contentRef}
                    value={form.content}
                    onChange={(e) => set("content", e.target.value)}
                    placeholder={"Write your article...\\n\\n## Heading\\n> Quote\\n- Bullet point\\n```ts\\nconst hello = 'world'\\n```"}
                    rows={15}
                    className={cn(
                      "w-full rounded-xl border bg-background px-4 py-4 text-base text-foreground placeholder:text-muted-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-y min-h-[280px] font-mono",
                      errors.content ? "border-destructive" : "border-border"
                    )}
                  />
                ) : (
                  <div className="rounded-xl border border-border bg-background p-5 min-h-[280px]">
                    <ContentPreview content={form.content} />
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Use Markdown-style formatting for headings, lists, quotes, and code.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Examples: <span className="font-mono">## Heading</span> <span className="font-mono">&gt; Quote</span> <span className="font-mono">- Bullet point</span> <span className="font-mono">```code```</span>
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  {errors.content ? (
                    <p className="text-xs text-destructive font-medium">{errors.content}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Paragraph breaks and markdown-like syntax are preserved in saved content.</p>
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
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <PenLine size={15} />}
                {isSubmitting ? "Publishing..." : "Publish"}
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
