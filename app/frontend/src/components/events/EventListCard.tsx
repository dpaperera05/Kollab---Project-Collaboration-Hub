import { ExternalLink, MapPin, Clock, Calendar, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EventItem } from "@/data/eventsData";

const TYPE_COLORS: Record<string, string> = {
  Hackathon: "bg-primary/10 text-primary border-primary/20",
  Workshop: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Talk: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Webinar: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
};

const MAX_VISIBLE_TAGS = 4;

const EventListCard = ({ event }: { event: EventItem }) => {
  const utcDate = new Date(event.startDateTimeUTC);
  const utcStr = utcDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const utcTime = utcDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  const localStr = utcDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const localTime = utcDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const visibleTags = event.tags.slice(0, MAX_VISIBLE_TAGS);
  const extraCount = event.tags.length - MAX_VISIBLE_TAGS;

  return (
    <article className="group rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200 hover:shadow-[var(--card-shadow-hover)] hover:border-primary/20">
      <div className="flex flex-col sm:flex-row">
        {/* Cover */}
        <div className="relative sm:w-56 md:w-64 lg:w-72 flex-shrink-0">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-44 sm:h-full object-cover"
            loading="lazy"
          />
          {event.featured && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col gap-3">
          {/* Top row: type + countdown */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", TYPE_COLORS[event.type] || "")}>
              {event.type}
            </span>
            {event.daysLeft > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <Timer size={12} className="text-primary" />
                ⏳ {event.daysLeft} days left
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-primary/70" />
              {utcStr} · {utcTime} UTC
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} className="text-primary/70" />
              {localStr} · {localTime} local
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-primary/70" />
              {event.locationType === "City" ? event.city : "Virtual"}
            </span>
          </div>

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
            <a
              href={event.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              Visit Event Site
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

export default EventListCard;
