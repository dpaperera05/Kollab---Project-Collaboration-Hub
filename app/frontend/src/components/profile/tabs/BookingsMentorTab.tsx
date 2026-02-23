import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, Check, X } from "lucide-react";
import { mockBookingsMentor, type MockBooking } from "@/data/mockProfileContent";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  Accepted: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Rejected: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

const BookingsMentorTab = () => {
  const [bookings, setBookings] = useState<MockBooking[]>([...mockBookingsMentor]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const pending = bookings.filter(b => b.status === "Pending");
  const now = new Date();
  const upcoming = bookings.filter(b => b.status === "Accepted" && new Date(b.date) >= now);
  const past = bookings.filter(b => (b.status === "Accepted" && new Date(b.date) < now) || b.status === "Rejected");

  const accept = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "Accepted" as const } : b));
    toast({ title: "Booking accepted", description: "Email sent to both parties (simulated)." });
  };

  const reject = (id: string) => {
    if (!reason.trim()) { toast({ title: "Reason required", variant: "destructive" }); return; }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "Rejected" as const, rejectionReason: reason.trim() } : b));
    toast({ title: "Booking rejected", description: "Email sent to both parties (simulated)." });
    setRejectingId(null);
    setReason("");
  };

  const BookingCard = ({ b, showActions }: { b: MockBooking; showActions: boolean }) => (
    <Card className="border-border card-shadow">
      <CardContent className="p-5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-foreground">{b.memberName}</h4>
          <Badge variant="outline" className={cn("text-xs", STATUS_STYLES[b.status])}>{b.status}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar size={10} />{new Date(b.date).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><Clock size={10} />{b.time}</span>
        </div>
        <p className="text-sm text-foreground font-medium">{b.agenda}</p>
        <p className="text-sm text-muted-foreground">{b.summary}</p>
        {b.notes && <p className="text-xs text-muted-foreground italic">Notes: {b.notes}</p>}
        {b.rejectionReason && <p className="text-xs text-muted-foreground italic">Reason: {b.rejectionReason}</p>}
        {showActions && b.status === "Pending" && (
          <>
            {rejectingId === b.id ? (
              <div className="space-y-2 pt-1">
                <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for rejection (required)..." rows={2} />
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={() => reject(b.id)}>Confirm Reject</Button>
                  <Button size="sm" variant="outline" onClick={() => { setRejectingId(null); setReason(""); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="gap-1" onClick={() => accept(b.id)}><Check size={12} /> Accept</Button>
                <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => setRejectingId(b.id)}><X size={12} /> Reject</Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Manage Bookings</h3>
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
            <div className="grid gap-4 sm:grid-cols-2">{pending.map(b => <BookingCard key={b.id} b={b} showActions />)}</div>
          )}
        </TabsContent>
        <TabsContent value="upcoming" className="mt-4">
          {upcoming.length === 0 ? (
            <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-muted-foreground text-sm">No upcoming sessions.</CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">{upcoming.map(b => <BookingCard key={b.id} b={b} showActions={false} />)}</div>
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          {past.length === 0 ? (
            <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-muted-foreground text-sm">No past sessions.</CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">{past.map(b => <BookingCard key={b.id} b={b} showActions={false} />)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingsMentorTab;
