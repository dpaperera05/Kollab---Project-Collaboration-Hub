import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet, apiPatch } from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  Accepted: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Rejected: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  Completed: "bg-primary/10 text-primary border-primary/30",
  NotCompleted: "bg-muted text-muted-foreground border-border",
  Canceled: "bg-muted text-muted-foreground border-border",
};

type ApiBooking = {
  _id: string;
  memberId: string;
  mentorId: string;
  date: string; // yyyy-mm-dd expected
  time: string; // HH:mm
  agenda?: string;
  summary?: string;
  notes?: string;
  status: "Pending" | "Accepted" | "Rejected" | "Canceled" | "Completed" | "NotCompleted";
  rejectionReason?: string;
};

const toDate = (dateStr: string) => {
  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  // fallback if date is not ISO; accept mm/dd/yyyy
  const [m, d, y] = dateStr.split(/[\/\-]/).map(Number);
  return new Date(y || 0, (m || 1) - 1, d || 1);
};

const BookingsMentorTab = () => {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pending = useMemo(() => bookings.filter(b => b.status === "Pending"), [bookings]);
  const upcoming = useMemo(() => bookings.filter(b => b.status === "Accepted"), [bookings]);
  const past = useMemo(() => bookings.filter(b => b.status === "Completed" || b.status === "NotCompleted" || b.status === "Rejected" || b.status === "Canceled"), [bookings]);
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

  const updateStatus = async (id: string, status: ApiBooking["status"], rejectionReason?: string) => {
    try {
      await apiPatch<{ success: boolean; data: { booking: ApiBooking } }>(`/bookings/${id}/status`, { status, rejectionReason });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status, rejectionReason: status === "Rejected" ? rejectionReason : undefined } : b));
    } catch (err: any) {
      toast({ title: "Failed", description: err?.message || "Could not update booking", variant: "destructive" });
    }
  };

  const accept = (id: string) => {
    updateStatus(id, "Accepted");
    toast({ title: "Booking accepted" });
  };

  const reject = (id: string) => {
    if (!reason.trim()) {
      toast({ title: "Reason required", variant: "destructive" });
      return;
    }
    updateStatus(id, "Rejected", reason.trim());
    toast({ title: "Booking rejected" });
    setRejectingId(null);
    setReason("");
  };

  const BookingCard = ({ b, showActions }: { b: ApiBooking; showActions: boolean }) => (
    <Card className="border-border card-shadow">
      <CardContent className="p-5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-foreground">{b.memberId}</h4>
          <Badge variant="outline" className={cn("text-xs", STATUS_STYLES[b.status])}>{b.status}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar size={10} />{new Date(b.date).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><Clock size={10} />{b.time}</span>
        </div>
        <p className="text-sm text-foreground font-medium">{b.agenda || "Session"}</p>
        {b.summary && <p className="text-sm text-muted-foreground">{b.summary}</p>}
        {b.notes && <p className="text-xs text-muted-foreground italic">Notes: {b.notes}</p>}
        {b.rejectionReason && <p className="text-xs text-muted-foreground italic">Reason: {b.rejectionReason}</p>}
        {showActions && b.status === "Pending" && (
          <>
            {rejectingId === b._id ? (
              <div className="space-y-2 pt-1">
                <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for rejection (required)..." rows={2} />
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={() => reject(b._id)}>Confirm Reject</Button>
                  <Button size="sm" variant="outline" onClick={() => { setRejectingId(null); setReason(""); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="gap-1" onClick={() => accept(b._id)}><Check size={12} /> Accept</Button>
                <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => setRejectingId(b._id)}><X size={12} /> Reject</Button>
              </div>
            )}
          </>
        )}

        {!showActions && b.status === "Accepted" && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="gap-1" onClick={() => updateStatus(b._id, "Completed").then(() => toast({ title: "Marked completed" }))}><Check size={12} /> Completed</Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => updateStatus(b._id, "NotCompleted").then(() => toast({ title: "Marked not completed" }))}>Not completed</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Manage Bookings</h3>

      {loading ? (
        <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-muted-foreground text-sm">Loading bookings...</CardContent></Card>
      ) : error ? (
        <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-destructive text-sm">{error}</CardContent></Card>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Past ({past.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">
            {pending.length === 0 ? (
              <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-muted-foreground text-sm">No pending requests.</CardContent></Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">{pending.map(b => <BookingCard key={b._id} b={b} showActions />)}</div>
            )}
          </TabsContent>
          <TabsContent value="upcoming" className="mt-4">
            {upcoming.length === 0 ? (
              <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-muted-foreground text-sm">No upcoming sessions.</CardContent></Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">{upcoming.map(b => <BookingCard key={b._id} b={b} showActions={false} />)}</div>
            )}
          </TabsContent>
          <TabsContent value="past" className="mt-4">
            {past.length === 0 ? (
              <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-muted-foreground text-sm">No past sessions.</CardContent></Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">{past.map(b => <BookingCard key={b._id} b={b} showActions={false} />)}</div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default BookingsMentorTab;
