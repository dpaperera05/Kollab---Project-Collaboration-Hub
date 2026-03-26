import { useMemo, useState } from "react";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { type Mentor } from "@/types/mentor";
import { requestBooking } from "@/lib/bookingStore";
import { toast } from "@/hooks/use-toast";
import { getSession } from "@/lib/authStore";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface MentorBookingModalProps {
  mentor: Mentor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MentorBookingModal = ({ mentor, open, onOpenChange }: MentorBookingModalProps) => {
  const [slot, setSlot] = useState("");
  const [agenda, setAgenda] = useState("");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const slotOptions = useMemo(() => {
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

  const handleClose = (val: boolean) => {
    if (!val) { setSlot(""); setAgenda(""); setSummary(""); setNotes(""); setSubmitted(false); }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Booking Requested!</h3>
              <p className="text-sm text-muted-foreground">
                Your session with <span className="font-semibold text-foreground">{mentor.name}</span> on <span className="font-semibold text-foreground">{selectedLabel}</span> has been requested.
              </p>
            </div>
            <button onClick={() => handleClose(false)} className="mt-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarCheck size={18} className="text-primary" />
                Book a Session
              </DialogTitle>
              <DialogDescription>Schedule a mentoring session with {mentor.name}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Time Slot *</label>
                <select value={slot} onChange={(e) => setSlot(e.target.value)} className="w-full h-9 pl-3 pr-8 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                  <option value="">Select a time slot</option>
                  {slotOptions.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Agenda / Goal *</label>
                <input value={agenda} onChange={(e) => setAgenda(e.target.value)} placeholder="e.g., Portfolio review" className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Mentorship Summary</label>
                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Describe what you need..." rows={2} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes..." rows={2} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <button onClick={handleSubmit} disabled={!slot || !agenda.trim() || isSubmitting} className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-brand-sm">
                {isSubmitting ? "Requesting..." : "Request Booking"}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MentorBookingModal;
