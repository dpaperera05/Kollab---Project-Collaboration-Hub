import { useMemo, useState } from "react";
import { CalendarCheck, CheckCircle2, ShieldCheck } from "lucide-react";
import { type Mentor } from "@/types/mentor";
import { requestBooking } from "@/lib/bookingStore";
import { toast } from "@/hooks/use-toast";
import { getSession } from "@/lib/authStore";
import { useLocation, useNavigate } from "react-router-dom";

interface MentorBookingCardProps {
  mentor: Mentor;
}

type SlotOption = {
  id: string;
  label: string;
  slot?: NonNullable<Mentor["availabilitySlots"]>[number];
};

const MentorBookingCard = ({ mentor }: MentorBookingCardProps) => {
  const [slot, setSlot] = useState("");
  const [agenda, setAgenda] = useState("");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const slotOptions: SlotOption[] = useMemo(() => {
    if (mentor.availabilitySlots?.length) {
      return mentor.availabilitySlots.map((s, idx) => ({
        id: String(idx),
        label: `${new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · ${s.startTime} - ${s.endTime}${s.timezone ? ` (${s.timezone})` : ""}`,
        slot: s,
      }));
    }
    return mentor.timeSlots.map((s) => ({ id: s, label: s }));
  }, [mentor]);

  const selectedLabel = useMemo(() => slotOptions.find((s) => s.id === slot)?.label || slot, [slotOptions, slot]);

  const handleSubmit = async () => {
    if (!slot || !agenda.trim()) return;

    const session = getSession();
    if (!session?.token) {
      toast({ title: "Login required", description: "Please login to book a session.", variant: "destructive" });
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const hasAvailability = mentor.availabilitySlots && mentor.availabilitySlots.length > 0;
    if (hasAvailability) {
      const selected = slotOptions.find((s) => s.id === slot)?.slot;
      if (!selected) return;
      setIsSubmitting(true);
      const { success, error } = await requestBooking({
        mentorId: mentor.id,
        date: selected.date,
        time: `${selected.startTime}-${selected.endTime}${selected.timezone ? ` (${selected.timezone})` : ""}`,
        agenda,
        summary,
        notes,
      });
      setIsSubmitting(false);
      if (!success) {
        toast({ title: "Booking failed", description: error || "Please try again", variant: "destructive" });
        return;
      }
    } else {
      const selected = slotOptions.find((s) => s.id === slot);
      if (!selected) return;
      const parts = selected.label.split("·").map((p) => p.trim());
      const date = parts[0] || selected.label;
      const time = parts[1] || selected.label;
      setIsSubmitting(true);
      const { success, error } = await requestBooking({
        mentorId: mentor.id,
        date,
        time,
        agenda,
        summary,
        notes,
      });
      setIsSubmitting(false);
      if (!success) {
        toast({ title: "Booking failed", description: error || "Please try again", variant: "destructive" });
        return;
      }
    }

    setSubmitted(true);
    toast({ title: "Booking requested!", description: `Confirmation email sent to you and ${mentor.name}.` });
  };

  const reset = () => {
    setSlot("");
    setAgenda("");
    setSummary("");
    setNotes("");
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 size={24} className="text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Booking Requested</h3>
            <p className="text-xs text-muted-foreground">Session on {selectedLabel} with {mentor.name}</p>
          </div>
          <button onClick={reset} className="text-xs font-semibold text-primary transition-colors hover:text-primary/80">
            Book another session
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <CalendarCheck size={16} className="text-primary" />
          <h3 className="text-base font-bold text-foreground">Book a Session</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Send a session request directly to {mentor.name}.</p>
      </div>

      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Time Slot *</label>
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select a time slot</option>
            {slotOptions.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Agenda / Goal *</label>
          <input
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            placeholder="e.g., Portfolio review"
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Mentorship Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Describe what you need..."
            rows={2}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Notes <span className="font-normal text-muted-foreground">(optional)</span></label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            rows={2}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="rounded-xl border border-border/80 bg-muted/35 p-2.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <ShieldCheck size={12} className="text-primary" />
            Request goes directly to the mentor
          </div>
          <p className="mt-1">You can track accepted and pending bookings from your profile.</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!slot || !agenda.trim() || isSubmitting}
          className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-brand-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Requesting..." : "Request Booking"}
        </button>
      </div>
    </section>
  );
};

export default MentorBookingCard;
