import { useEffect, useMemo, useState } from "react";
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const STATUS_COLORS: Record<string, string> = {
  Accepted: "bg-primary/15 text-primary border-primary/30",
  Pending: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  Rejected: "bg-red-500/15 text-red-700 border-red-500/30",
  Canceled: "bg-muted text-muted-foreground border-muted",
};

type ApiBooking = {
  _id: string;
  memberId: string;
  mentorId: string;
  memberName?: string;
  mentorName?: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  agenda?: string;
  summary?: string;
  notes?: string;
  status: "Pending" | "Accepted" | "Rejected" | "Canceled" | "Completed" | "NotCompleted";
};

const toDate = (dateStr: string) => {
  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const [m, d, y] = dateStr.split(/[\/\-]/).map(Number);
  return new Date(y || 0, (m || 1) - 1, d || 1);
};

const BookingsCalendarTab = () => {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await apiGet<{ success: boolean; data: { bookings: ApiBooking[] } }>("/bookings/mentor");
        setBookings(res.data.bookings || []);
        setError(null);
      } catch (err: any) {
        setError(err?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const grid = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    const days: Date[] = [];
    let cursor = start;
    while (cursor <= end) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [month]);

  const upcomingAndPending = useMemo(() => bookings.filter(b => {
    const isPending = b.status === "Pending";
    const isAcceptedActive = b.status === "Accepted"; // stays until explicitly completed/not completed
    return isPending || isAcceptedActive;
  }), [bookings]);

  const bookingsByDate = useMemo(() => upcomingAndPending.reduce<Record<string, ApiBooking[]>>((acc, b) => {
    const key = b.date;
    acc[key] = acc[key] ? [...acc[key], b] : [b];
    return acc;
  }, {}), [upcomingAndPending]);

  const monthLabel = format(month, "MMMM yyyy");
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Calendar</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMonth(startOfMonth(new Date()))} className="gap-2"><RefreshCcw size={14} /> Today</Button>
          <div className="flex items-center gap-1 border border-border rounded-md">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMonth(addMonths(month, -1))}><ChevronLeft size={16} /></Button>
            <span className="px-3 text-sm font-medium">{monthLabel}</span>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMonth(addMonths(month, 1))}><ChevronRight size={16} /></Button>
          </div>
        </div>
      </div>
        {loading ? (
          <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-muted-foreground text-sm">Loading bookings...</CardContent></Card>
        ) : error ? (
          <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-destructive text-sm">{error}</CardContent></Card>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-7 text-xs font-semibold text-muted-foreground px-1">
              {weekDays.map(day => <div key={day} className="text-center py-1">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px rounded-lg border border-border bg-border">
              {grid.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const items = bookingsByDate[key] || [];
                const inMonth = isSameMonth(day, month);
                return (
                  <div key={key} className={cn(
                    "min-h-[120px] bg-card p-2 flex flex-col gap-1",
                    !inMonth && "bg-muted/30 text-muted-foreground"
                  )}>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={cn("rounded-full h-6 w-6 flex items-center justify-center", isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground")}>{format(day, "d")}</span>
                    </div>
                    <div className="space-y-1">
                      {items.length === 0 ? (
                        <div className="text-[11px] text-muted-foreground">No bookings</div>
                      ) : (
                        items.slice(0, 3).map(b => (
                          <Popover key={b._id} open={openId === b._id} onOpenChange={(open) => setOpenId(open ? b._id : null)}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className={cn("w-full text-left text-[11px] px-2 py-1 rounded border line-clamp-1 transition hover:shadow-sm", STATUS_COLORS[b.status] || "bg-muted text-foreground border-border")}
                              >
                                <span className="font-semibold">{b.time}</span>
                                <span className="opacity-80"> · {b.agenda || "Session"}</span>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              side="right"
                              align="start"
                              sideOffset={8}
                              className="w-[320px] max-w-[320px] p-2.5 shadow-md border border-border bg-slate-50 dark:bg-slate-900/90 rounded-lg"
                            >
                              <div className="space-y-2 text-[13px] leading-snug">
                                <div className="flex items-start justify-between gap-2 pb-2 border-b border-border/70">
                                  <div className="flex items-start gap-2">
                                    <span className="mt-1 h-3 w-3 rounded-full bg-primary"></span>
                                    <div className="space-y-0.5">
                                      <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Session</div>
                                      <div className="text-sm font-semibold text-foreground leading-tight">{b.agenda || "Booking"}</div>
                                      <div className="text-[11px] text-muted-foreground">{format(toDate(b.date), "PPP")} · {b.time}</div>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className={cn("text-[11px] px-2 py-0.5 rounded-full border", STATUS_COLORS[b.status] || "bg-muted text-foreground border-border")}>{b.status}</Badge>
                                </div>

                                <div className="text-[12px] text-muted-foreground">
                                  <div className="rounded-md border border-border bg-white/70 dark:bg-slate-800/80 p-2 shadow-sm">
                                    <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Member</div>
                                    <div className="text-foreground font-semibold truncate text-[13px] mt-0.5">{b.memberName || "Member"}</div>
                                  </div>
                                </div>

                                <div className="rounded-md border border-border bg-white/80 dark:bg-slate-800/70 p-2 space-y-1">
                                  <div className="text-xs font-semibold text-foreground">Overview</div>
                                  <p className="text-[13px] text-muted-foreground leading-snug">{b.summary || b.agenda || "Session"}</p>
                                </div>

                                {b.notes && (
                                  <div className="rounded-md border border-border bg-white/80 dark:bg-slate-800/70 p-2 space-y-1">
                                    <div className="text-xs font-semibold text-foreground">Notes</div>
                                    <p className="text-[13px] text-muted-foreground leading-snug whitespace-pre-wrap">{b.notes}</p>
                                  </div>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        ))
                      )}
                      {items.length > 3 && (
                        <div className="text-[11px] text-muted-foreground">+ {items.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </>
  );
};

export default BookingsCalendarTab;
