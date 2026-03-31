import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, Loader2, X } from "lucide-react";
import { apiGet, apiPatch } from "@/lib/api";
import { cn } from "@/lib/utils";

type ApiBooking = {
  _id: string;
  memberId: string;
  mentorId: string;
  mentorName?: string;
  memberName?: string;
  date: string;
  time: string;
  agenda?: string;
  summary?: string;
  notes?: string;
  status: "Pending" | "Accepted" | "Rejected" | "Canceled" | "Completed" | "NotCompleted";
  rejectionReason?: string;
};

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  Accepted: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Rejected: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  Canceled: "bg-muted text-muted-foreground border-muted",
  Completed: "bg-primary/10 text-primary border-primary/20",
  NotCompleted: "bg-muted text-muted-foreground border-muted",
};

const BookingsMemberTab = () => {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await apiGet<{ success: boolean; data: { bookings: ApiBooking[] } }>("/bookings/member");
      setBookings(res.data.bookings || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const now = new Date();
  const { pending, upcoming, past } = useMemo(() => {
    const pendingList: ApiBooking[] = [];
    const upcomingList: ApiBooking[] = [];
    const pastList: ApiBooking[] = [];

    bookings.forEach((b) => {
      if (b.status === "Pending") {
        pendingList.push(b);
      } else if (b.status === "Accepted") {
        upcomingList.push(b);
      } else {
        pastList.push(b);
      }
    });

    return { pending: pendingList, upcoming: upcomingList, past: pastList };
  }, [bookings, now]);

  const cancel = async (id: string) => {
    try {
      await apiPatch<{ success: boolean; data: { booking: ApiBooking } }>(`/bookings/${id}/status`, { status: "Canceled" });
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: "Canceled" } : b)));
      toast({ title: "Booking cancelled" });
    } catch (err: any) {
      toast({ title: "Failed to cancel", description: err?.message || "Something went wrong", variant: "destructive" });
    }
  };

  const BookingCard = ({ b, showCancel }: { b: ApiBooking; showCancel: boolean }) => (
    <Card className="border-border card-shadow">
      <CardContent className="p-5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-foreground">{b.mentorName || "Mentor"}</h4>
          <Badge variant="outline" className={cn("text-xs", STATUS_STYLES[b.status])}>{b.status}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar size={10} />{new Date(b.date).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><Clock size={10} />{b.time}</span>
        </div>
        <p className="text-sm text-foreground font-medium">{b.agenda || "Session"}</p>
        <p className="text-sm text-muted-foreground">{b.summary || ""}</p>
        {b.notes && <p className="text-xs text-muted-foreground italic">Notes: {b.notes}</p>}
        {showCancel && b.status === "Pending" && (
          <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive mt-1" onClick={() => cancel(b._id)}><X size={12} /> Cancel</Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">My Bookings</h3>
      <Tabs defaultValue="pending">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          {loading ? (
            <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading bookings...</CardContent></Card>
          ) : error ? (
            <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-destructive text-sm">{error}</CardContent></Card>
          ) : pending.length === 0 ? (
            <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-muted-foreground text-sm">No pending bookings.</CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">{pending.map(b => <BookingCard key={b._id} b={b} showCancel />)}</div>
          )}
        </TabsContent>
        <TabsContent value="upcoming" className="mt-4">
          {loading ? (
            <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading bookings...</CardContent></Card>
          ) : error ? (
            <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-destructive text-sm">{error}</CardContent></Card>
          ) : upcoming.length === 0 ? (
            <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-muted-foreground text-sm">No upcoming bookings.</CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">{upcoming.map(b => <BookingCard key={b._id} b={b} showCancel={false} />)}</div>
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          {loading ? (
            <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading bookings...</CardContent></Card>
          ) : error ? (
            <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-destructive text-sm">{error}</CardContent></Card>
          ) : past.length === 0 ? (
            <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-muted-foreground text-sm">No past bookings.</CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">{past.map(b => <BookingCard key={b._id} b={b} showCancel={false} />)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingsMemberTab;
