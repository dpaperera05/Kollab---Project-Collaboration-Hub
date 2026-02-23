import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Wrench, FolderKanban, Briefcase, MessageCircle, Settings } from "lucide-react";
import { type KollabUser } from "@/lib/authStore";
import OverviewTab from "./OverviewTab";
import SkillsToolsTab from "./SkillsToolsTab";
import ProjectsTab from "./ProjectsTab";
import PortfolioTab from "./PortfolioTab";
import ChatsTab from "./ChatsTab";
import SettingsTab from "./SettingsTab";

interface Props { user: KollabUser; onUpdate: () => void; }

const tabs = [
  { value: "overview", label: "Overview", icon: User },
  { value: "skills", label: "Skills & Tools", icon: Wrench },
  { value: "projects", label: "Projects", icon: FolderKanban },
  { value: "portfolio", label: "Portfolio", icon: Briefcase },
  { value: "chats", label: "Chats", icon: MessageCircle },
  { value: "settings", label: "Settings", icon: Settings },
];

const ProfileTabs = ({ user, onUpdate }: Props) => (
  <Tabs defaultValue="overview" className="w-full">
    <TabsList className="w-full justify-start gap-1 bg-card border border-border p-1.5 rounded-xl h-auto flex-wrap card-shadow">
      {tabs.map(t => (
        <TabsTrigger
          key={t.value}
          value={t.value}
          className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
        >
          <t.icon size={14} />
          <span className="hidden sm:inline">{t.label}</span>
        </TabsTrigger>
      ))}
    </TabsList>

    <div className="mt-8">
      <TabsContent value="overview"><OverviewTab user={user} onUpdate={onUpdate} /></TabsContent>
      <TabsContent value="skills"><SkillsToolsTab user={user} onUpdate={onUpdate} /></TabsContent>
      <TabsContent value="projects"><ProjectsTab user={user} /></TabsContent>
      <TabsContent value="portfolio"><PortfolioTab user={user} /></TabsContent>
      <TabsContent value="chats"><ChatsTab user={user} /></TabsContent>
      <TabsContent value="settings"><SettingsTab user={user} onUpdate={onUpdate} /></TabsContent>
    </div>
  </Tabs>
);

export default ProfileTabs;
