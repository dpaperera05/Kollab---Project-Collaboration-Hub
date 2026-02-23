import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, X } from "lucide-react";
import { mockBookingsMember, type MockBooking } from "@/data/mockProfileContent";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  Accepted: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Rejected: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

const BookingsMemberTab = () => {
  const [bookings, setBookings] = useState<MockBooking[]>([...mockBookingsMember]);

  const now = new Date();
  const upcoming = bookings.filter(b => new Date(b.date) >= now && b.status !== "Rejected");
  const past = bookings.filter(b => new Date(b.date) < now || b.status === "Rejected");

  const cancel = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    toast({ title: "Booking cancelled" });
  };

  const BookingCard = ({ b, showCancel }: { b: MockBooking; showCancel: boolean }) => (
    <Card className="border-border card-shadow">
      <CardContent className="p-5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-foreground">{b.mentorName}</h4>
          <Badge variant="outline" className={cn("text-xs", STATUS_STYLES[b.status])}>{b.status}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar size={10} />{new Date(b.date).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><Clock size={10} />{b.time}</span>
        </div>
        <p className="text-sm text-foreground font-medium">{b.agenda}</p>
        <p className="text-sm text-muted-foreground">{b.summary}</p>
        {b.notes && <p className="text-xs text-muted-foreground italic">Notes: {b.notes}</p>}
        {showCancel && b.status === "Pending" && (
          <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive mt-1" onClick={() => cancel(b.id)}><X size={12} /> Cancel</Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">My Bookings</h3>
      <Tabs defaultValue="upcoming">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          {upcoming.length === 0 ? (
            <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-muted-foreground text-sm">No upcoming bookings.</CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">{upcoming.map(b => <BookingCard key={b.id} b={b} showCancel />)}</div>
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          {past.length === 0 ? (
            <Card className="border-border card-shadow"><CardContent className="py-8 text-center text-muted-foreground text-sm">No past bookings.</CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">{past.map(b => <BookingCard key={b.id} b={b} showCancel={false} />)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingsMemberTab;
