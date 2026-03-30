import { CalendarClock, Clock3, MapPin } from "lucide-react";
import type { Mentor } from "@/types/mentor";

type Slot = NonNullable<Mentor["availabilitySlots"]>[number];

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "Flexible date";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

const formatTimeRange = (slot: Slot) => `${slot.startTime} - ${slot.endTime}${slot.timezone ? ` (${slot.timezone})` : ""}`;

const MentorAvailability = ({ mentor }: { mentor: Mentor }) => {
  const slots = mentor.availabilitySlots || [];
  const fallbackSlots = mentor.timeSlots || [];

  const hasStructuredSlots = slots.length > 0;
  const hasAnySlots = hasStructuredSlots || fallbackSlots.length > 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarClock size={16} className="text-primary" />
          <h2 className="text-base font-bold text-foreground">Availability</h2>
        </div>
        {hasAnySlots && (
          <span className="text-xs text-muted-foreground"></span>
        )}
      </div>

      {hasStructuredSlots ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {slots.map((slot, idx) => (
            <div
              key={`${slot.date}-${slot.startTime}-${idx}`}
              className="rounded-md border border-border bg-muted/40 p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Clock3 size={13} className="text-primary" />
                    {formatTimeRange(slot)}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{formatDate(slot.date)}</p>
                </div>
                {slot.timezone && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 text-primary px-2 py-0.5 text-[10px] font-semibold">
                    <MapPin size={11} />
                    {slot.timezone}
                  </span>
                )}
              </div>
              {slot.note && <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{slot.note}</p>}
            </div>
          ))}
        </div>
      ) : hasAnySlots ? (
        <div className="flex flex-wrap gap-2">
          {fallbackSlots.map((slot) => (
            <span
              key={slot}
              className="rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-medium border border-border/80"
            >
              {slot}
            </span>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          This mentor has not shared availability yet. Check back soon or send a chat to coordinate times.
        </div>
      )}
    </div>
  );
};

export default MentorAvailability;