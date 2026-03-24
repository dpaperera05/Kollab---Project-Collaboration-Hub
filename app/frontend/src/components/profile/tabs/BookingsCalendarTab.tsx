import { useEffect, useMemo, useState } from "react";
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";

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
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  agenda?: string;
  summary?: string;
  notes?: string;
  status: "Pending" | "Accepted" | "Rejected" | "Canceled";
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

  const bookingsByDate = useMemo(() => bookings.reduce<Record<string, ApiBooking[]>>((acc, b) => {
    const key = b.date;
    acc[key] = acc[key] ? [...acc[key], b] : [b];
    return acc;
  }, {}), [bookings]);

  const monthLabel = format(month, "MMMM yyyy");
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
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
                        <div key={b._id} className={cn("text-[11px] px-2 py-1 rounded border line-clamp-1", STATUS_COLORS[b.status] || "bg-muted text-foreground border-border")}> 
                          <span className="font-semibold">{b.time}</span> 
                          <span className="opacity-80"> · {b.agenda || "Session"}</span>
                        </div>
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
  );
};

export default BookingsCalendarTab;
