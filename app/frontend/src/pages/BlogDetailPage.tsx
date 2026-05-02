import { useEffect, useState, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, MessageCircle, BookOpen } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type BlogDetail } from "@/data/blogsData";
import { apiGet } from "@/lib/api";

type BlogComment = {
  id: string;
  blogId: string;
  authorName: string;
  text: string;
  createdAt: string;
};

/* ── Content Renderer ───────────────────────────────────── */

const BlogContentRenderer = ({ content }: { content?: string }) => {
  if (!content) {
    return <p className="text-sm text-muted-foreground">No content available for this blog.</p>;
  }

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

  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let inCodeBlock = false;
  let codeLines: string[] = [];

  while (i < lines.length) {
    const raw = lines[i] ?? "";
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        blocks.push(
          <pre key={`code-${i}`} className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-4">
            <code className="font-mono text-sm text-foreground">{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      i += 1;
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(raw);
      i += 1;
      continue;
    }

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3 key={`h3-${i}`} className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          {renderInlineCode(trimmed.slice(4))}
        </h3>
      );
      i += 1;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2 key={`h2-${i}`} className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {renderInlineCode(trimmed.slice(3))}
        </h2>
      );
      i += 1;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      const quoteLines: string[] = [];
      let j = i;
      while (j < lines.length && (lines[j] ?? "").trim().startsWith("> ")) {
        quoteLines.push((lines[j] ?? "").trim().slice(2));
        j += 1;
      }
      blocks.push(
        <blockquote key={`quote-${i}`} className="rounded-r-xl border-l-4 border-primary bg-primary/5 px-4 py-3 text-sm sm:text-base italic text-foreground/90">
          {renderInlineCode(quoteLines.join(" "))}
        </blockquote>
      );
      i = j;
      continue;
    }

    if (/^-\s+/.test(trimmed)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^-\s+/.test((lines[j] ?? "").trim())) {
        items.push((lines[j] ?? "").trim().replace(/^-\s+/, ""));
        j += 1;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="list-disc pl-6 space-y-2 text-foreground/90 leading-7">
          {items.map((item, idx) => (
            <li key={`ul-item-${i}-${idx}`}>{renderInlineCode(item)}</li>
          ))}
        </ul>
      );
      i = j;
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^\d+\.\s+/.test((lines[j] ?? "").trim())) {
        items.push((lines[j] ?? "").trim().replace(/^\d+\.\s+/, ""));
        j += 1;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="list-decimal pl-6 space-y-2 text-foreground/90 leading-7">
          {items.map((item, idx) => (
            <li key={`ol-item-${i}-${idx}`}>{renderInlineCode(item)}</li>
          ))}
        </ol>
      );
      i = j;
      continue;
    }

    const paragraphLines = [trimmed];
    let j = i + 1;
    while (j < lines.length) {
      const next = (lines[j] ?? "").trim();
      if (!next || next.startsWith("## ") || next.startsWith("### ") || next.startsWith("> ") || /^-\s+/.test(next) || /^\d+\.\s+/.test(next) || next.startsWith("```")) break;
      paragraphLines.push(next);
      j += 1;
    }

    blocks.push(
      <p key={`p-${i}`} className="text-base sm:text-lg text-foreground/85 leading-8">
        {renderInlineCode(paragraphLines.join(" "))}
      </p>
    );
    i = j;
  }

  return (
    <div className="space-y-6 break-words">{blocks}</div>
  );
};

/* ── Comment Item ───────────────────────────────────────── */

const CommentItem = ({ comment }: { comment: BlogComment }) => {
  const dateStr = new Date(comment.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = new Date(comment.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 mt-0.5">
        {comment.authorName.charAt(0)}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground">{comment.authorName}</span>
          <span className="text-xs text-muted-foreground">{dateStr} · {timeStr}</span>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">{comment.text}</p>
      </div>
    </div>
  );
};

/* ── Comments Section ───────────────────────────────────── */

const BlogCommentsSection = ({ blogId }: { blogId: string }) => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const newComment: BlogComment = {
      id: `new-${Date.now()}`,
      blogId,
      authorName: "You",
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newComment]);
    setText("");
  };

  return (
    <section className="space-y-6 rounded-2xl border border-border bg-card/70 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <MessageCircle size={20} className="text-primary" />
        <h3 className="text-xl font-bold text-foreground">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="space-y-5">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4 px-4 rounded-xl bg-muted/40 border border-border/60">No comments yet. Be the first to share your thoughts!</p>
      )}

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t border-border">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts..."
          rows={3}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post Comment
          </button>
        </div>
      </form>
    </section>
  );
};

/* ── Not Found State ────────────────────────────────────── */

const BlogNotFound = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-1 pt-20 flex items-center justify-center">
      <div className="text-center space-y-5 px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <BookOpen size={28} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Blog not found</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          The blog post you're looking for doesn't exist or may have been removed.
        </p>
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <ArrowLeft size={14} />
          Back to Blogs
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);

/* ── Main Page ──────────────────────────────────────────── */

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiGet<{
          success: boolean;
          data: { blog: BlogDetail };
        }>(`/blogs/public/${id}`);
        setBlog(response.data.blog);
      } catch (err: any) {
        setError(err?.message || "Failed to load blog");
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading blog...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!blog || error) return <BlogNotFound />;

  const dateStr = new Date(blog.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Hero header with cover image */}
        <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[440px] overflow-hidden">
          {blog.coverImage ? (
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/25 via-primary/10 to-accent/20" />
          )}
          {/* Subtle overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/15" />

          {/* Content on image */}
          <Container className="absolute inset-0 flex flex-col justify-end pb-8 sm:pb-10">
            {/* Back button */}
            <Link
              to="/blogs"
              className="absolute top-6 left-4 sm:left-5 lg:left-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm text-white text-xs font-medium hover:bg-white/25 transition-colors border border-white/10"
            >
              <ArrowLeft size={13} />
              Back
            </Link>

            <div className="space-y-3 max-w-3xl pr-2">
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {(blog.tags || []).map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-white/15 backdrop-blur-sm text-white border-white/20 text-[11px] font-medium px-2.5 py-0.5 rounded-md hover:bg-white/25"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight text-balance">
                {blog.title}
              </h1>

              {/* Meta row */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-white">
                    {blog.author.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-white/90">{blog.author.name}</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border",
                      blog.author.type === "mentor"
                        ? "bg-amber-500/20 text-amber-200 border-amber-400/30"
                        : "bg-primary/20 text-primary-foreground border-primary/30"
                    )}
                  >
                    {blog.author.type}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-white/70">
                  <Calendar size={12} />
                  {dateStr}
                </span>
              </div>
            </div>
          </Container>
        </div>

        {/* Article body */}
        <Container className="py-10 lg:py-14">
          <div className="max-w-3xl mx-auto space-y-12 px-1 sm:px-0">
            {/* Content */}
            <article className="rounded-2xl border border-border bg-card/70 p-5 sm:p-8 lg:p-10 shadow-sm">
              <BlogContentRenderer content={blog.content} />
            </article>

            {/* Divider */}
            <hr className="border-border" />

            {/* Comments */}
            <BlogCommentsSection blogId={blog.id} />
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetailPage;
