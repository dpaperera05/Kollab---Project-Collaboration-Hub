import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BlogItem } from "@/data/blogsData";

const MAX_VISIBLE_TAGS = 4;

const BlogListItemCard = ({ blog }: { blog: BlogItem }) => {
  const dateStr = new Date(blog.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const visibleTags = blog.tags.slice(0, MAX_VISIBLE_TAGS);
  const extraCount = blog.tags.length - MAX_VISIBLE_TAGS;

  const cover = blog.coverImage;

  return (
    <article className="group rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200 hover:shadow-[var(--card-shadow-hover)] hover:border-primary/20">
      <div className="flex flex-col sm:flex-row">
        {/* Cover */}
        <div className="relative sm:w-56 md:w-64 lg:w-72 flex-shrink-0">
          {cover ? (
            <img
              src={cover}
              alt={blog.title}
              className="w-full h-48 sm:h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-48 sm:h-full bg-gradient-to-br from-primary/15 via-primary/5 to-accent/20 flex items-center justify-center text-xs font-semibold text-primary">
              No cover
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col gap-3">
          {/* Author + date */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {blog.author.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-foreground">{blog.author.name}</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border",
                  blog.author.type === "mentor"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-primary/10 text-primary border-primary/20"
                )}
              >
                {blog.author.type}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Calendar size={12} className="text-primary/70" />
              {dateStr}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
            {blog.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {blog.excerpt}
          </p>

          {/* Tags + CTA */}
          <div className="flex items-center justify-between gap-3 mt-auto pt-1">
            <div className="flex flex-wrap gap-1.5">
              {visibleTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[11px] font-medium px-2 py-0.5 rounded-md">
                  {tag}
                </Badge>
              ))}
              {extraCount > 0 && (
                <Badge variant="outline" className="text-[11px] font-medium px-2 py-0.5 rounded-md">
                  +{extraCount} more
                </Badge>
              )}
            </div>
            <Link
              to={`/blogs/${blog.id}`}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              Read
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogListItemCard;
