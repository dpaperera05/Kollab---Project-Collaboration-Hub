import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Clock, FileText, Calendar, MessageCircle, Settings, CalendarRange, FolderKanban } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { type KollabUser } from "@/lib/authStore";
import MentorProfileTab from "./MentorProfileTab";
import BookingsMentorTab from "./BookingsMentorTab";
import BookingsCalendarTab from "./BookingsCalendarTab";
import BlogsManagerTab from "./BlogsManagerTab";
import EventsManagerTab from "./EventsManagerTab";
import ChatsTab from "./ChatsTab";
import SettingsTab from "@/components/profile/SettingsTab";
import MentorAvailabilityTab from "./MentorAvailabilityTab";
import ManageProjectsTab from "./ManageProjectsTab";

interface Props { user: KollabUser; onUpdate: () => void; }

const tabs = [
  { value: "profile", label: "Mentor Profile", icon: User },
  { value: "availability", label: "Availability", icon: CalendarRange },
  { value: "projects", label: "Projects", icon: FolderKanban },
  { value: "bookings", label: "Bookings", icon: Clock },
   { value: "calendar", label: "Calendar", icon: Calendar },
  { value: "blogs", label: "Blogs", icon: FileText },
  { value: "events", label: "Events", icon: Calendar },
  { value: "chats", label: "Chats", icon: MessageCircle },
  { value: "settings", label: "Settings", icon: Settings },
];

const MentorTabs = ({ user, onUpdate }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
  <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
    <TabsList className="w-full justify-start gap-1 bg-card border border-border p-1.5 rounded-xl h-auto flex-wrap card-shadow">
      {tabs.map(t => (
        <TabsTrigger key={t.value} value={t.value}
          className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all">
          <t.icon size={14} /><span className="hidden sm:inline">{t.label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
    <div className="mt-8">
      <TabsContent value="profile"><MentorProfileTab user={user} onUpdate={onUpdate} /></TabsContent>
      <TabsContent value="availability"><MentorAvailabilityTab user={user} onUpdate={onUpdate} /></TabsContent>
      <TabsContent value="projects"><ManageProjectsTab /></TabsContent>
      <TabsContent value="bookings"><BookingsMentorTab /></TabsContent>
      <TabsContent value="calendar"><BookingsCalendarTab /></TabsContent>
      <TabsContent value="blogs"><BlogsManagerTab /></TabsContent>
      <TabsContent value="events"><EventsManagerTab /></TabsContent>
      <TabsContent value="chats"><ChatsTab /></TabsContent>
      <TabsContent value="settings"><SettingsTab user={user} onUpdate={onUpdate} /></TabsContent>
    </div>
  </Tabs>
  );
};

export default MentorTabs;
