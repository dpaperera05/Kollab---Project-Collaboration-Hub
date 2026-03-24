import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import TimePicker from "@/components/ui/time-picker";
import { CalendarRange, Clock, MapPin, Plus, Save, Trash2 } from "lucide-react";
import type { KollabUser, AvailabilitySlot } from "@/lib/authStore";
import { saveAvailabilitySlots } from "@/lib/profileStore";

interface Props {
  user: KollabUser;
  onUpdate: () => void;
}

const toDisplay = (slot: AvailabilitySlot) => {
  const date = slot.date ? new Date(slot.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : slot.date;
  return `${date} · ${slot.startTime} - ${slot.endTime}${slot.timezone ? ` (${slot.timezone})` : ""}`;
};

const MentorAvailabilityTab = ({ user, onUpdate }: Props) => {
  const initialSlots = useMemo(() => user.profile?.availabilitySlots || [], [user.profile]);
  const defaultTz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", []);
  const timezoneOptions = useMemo(() => {
    const supported = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
    const fallback = [
      "UTC",
      "America/New_York",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Berlin",
      "Africa/Johannesburg",
      "Asia/Colombo",
      "Asia/Kolkata",
      "Asia/Tokyo",
      "Australia/Sydney",
    ];
    const list = supported.length ? supported : fallback;
    const merged = defaultTz ? [defaultTz, ...list] : list;
    return Array.from(new Set(merged)).sort();
  }, [defaultTz]);

  const [slots, setSlots] = useState<AvailabilitySlot[]>(initialSlots);
  const [draft, setDraft] = useState<AvailabilitySlot>({ date: "", startTime: "", endTime: "", timezone: defaultTz });
  const [saving, setSaving] = useState(false);

  const addSlot = async () => {
    if (!draft.date || !draft.startTime || !draft.endTime) {
      toast({ title: "Missing fields", description: "Add a date, start time, and end time.", variant: "destructive" });
      return;
    }
    const newSlot: AvailabilitySlot = { ...draft, timezone: draft.timezone || defaultTz };
    const nextSlots = [...slots, newSlot];
    setSaving(true);
    setSlots(nextSlots);
    setDraft({ date: "", startTime: "", endTime: "", timezone: draft.timezone || defaultTz });
    const { success, error } = await saveAvailabilitySlots(nextSlots);
    setSaving(false);
    if (!success) {
      setSlots(slots);
      toast({ title: "Failed to save", description: error || "Try again", variant: "destructive" });
      return;
    }
    toast({ title: "Availability saved" });
    onUpdate();
  };

  const removeSlot = async (idx: number) => {
    const nextSlots = slots.filter((_, i) => i !== idx);
    setSaving(true);
    setSlots(nextSlots);
    const { success, error } = await saveAvailabilitySlots(nextSlots);
    setSaving(false);
    if (!success) {
      toast({ title: "Failed to save", description: error || "Try again", variant: "destructive" });
      // best effort re-fetch via onUpdate; keep local list as-is to avoid bounce
      return;
    }
    toast({ title: "Availability updated" });
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock size={18} className="text-primary" />
          Availability
        </h3>
      </div>

      <Card className="border-border card-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2"><CalendarRange size={16} className="text-primary" /> Add a slot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Date</label>
              <Input type="date" value={draft.date} onChange={(e) => setDraft((p) => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Start</label>
              <TimePicker value={draft.startTime} onChange={(val) => setDraft((p) => ({ ...p, startTime: val }))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">End</label>
              <TimePicker value={draft.endTime} onChange={(val) => setDraft((p) => ({ ...p, endTime: val }))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1"><MapPin size={12} /> Timezone</label>
              <select
                value={draft.timezone || ""}
                onChange={(e) => setDraft((p) => ({ ...p, timezone: e.target.value }))}
                className="w-full h-9 pl-3 pr-8 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select timezone</option>
                {timezoneOptions.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" className="gap-2" onClick={addSlot} disabled={saving}>
              <Plus size={14} />
              {saving ? "Saving..." : "Add Slot"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border card-shadow">
        <CardHeader className="pb-4"><CardTitle className="text-base">Your slots ({slots.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No availability yet. Add slots so members can book you.</p>
          ) : (
            <div className="space-y-2">
              {slots.map((slot, idx) => (
                <div key={`${slot.date}-${slot.startTime}-${slot.endTime}-${idx}`} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{toDisplay(slot)}</p>
                    {slot.timezone && <Badge variant="outline" className="text-[11px] px-2 py-0.5">{slot.timezone}</Badge>}
                  </div>
                  <button onClick={() => removeSlot(idx)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove slot">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorAvailabilityTab;
