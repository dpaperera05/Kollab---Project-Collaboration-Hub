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
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarClock size={16} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">Availability</h2>
        </div>
        {hasAnySlots && <span className="text-xs font-medium text-muted-foreground">{slots.length || fallbackSlots.length} slot(s)</span>}
      </div>

      {hasStructuredSlots ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {slots.map((slot, idx) => (
            <div
              key={`${slot.date}-${slot.startTime}-${idx}`}
              className="rounded-xl border border-border/80 bg-gradient-to-b from-background to-muted/35 p-3.5"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Clock3 size={13} className="text-primary" />
                    {formatTimeRange(slot)}
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground">{formatDate(slot.date)}</p>
                </div>
                {slot.timezone && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    <MapPin size={11} />
                    {slot.timezone}
                  </span>
                )}
              </div>
              {slot.note && <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">{slot.note}</p>}
            </div>
          ))}
        </div>
      ) : hasAnySlots ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {fallbackSlots.map((slot) => (
            <span
              key={slot}
              className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
            >
              {slot}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/35 p-4 text-sm text-muted-foreground">
          This mentor has not shared availability yet. Check back soon or send a chat to coordinate times.
        </div>
      )}
    </section>
  );
};

export default MentorAvailability;