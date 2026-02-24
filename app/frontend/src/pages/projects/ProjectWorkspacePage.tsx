import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import ChatPanel from "@/components/workspace/ChatPanel";
import KanbanBoard from "@/components/workspace/KanbanBoard";
import MembersModal from "@/components/workspace/MembersModal";
import { getWorkspaceProject } from "@/data/workspaceData";
import { getSession } from "@/lib/authStore";

type Tab = "chat" | "kanban";

const ProjectWorkspacePage = () => {
  const { id } = useParams<{ id: string }>();
  const session = getSession();

  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  // Mobile sidebar drawer
  const [mobileDrawer, setMobileDrawer] = useState(false);

  if (!session) return <Navigate to="/login" replace />;

  const project = getWorkspaceProject(id || "");
  if (!project) {
    return (
      <>
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Workspace not found</h2>
            <p className="text-muted-foreground">This project workspace doesn't exist.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />
      <div className="flex-1 flex flex-col pt-16 overflow-hidden">
        <WorkspaceHeader
          project={project}
          onShowMembers={() => setMembersOpen(true)}
        />

        <div className="flex flex-1 overflow-hidden relative">
          {/* Mobile sidebar overlay */}
          {mobileDrawer && (
            <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileDrawer(false)} />
          )}

          {/* Sidebar — desktop always, mobile as drawer */}
          <div className={`${mobileDrawer ? "fixed inset-y-0 left-0 z-50 pt-16" : "hidden lg:flex"}`}>
            <WorkspaceSidebar
              project={project}
              activeTab={activeTab}
              onTabChange={(tab) => { setActiveTab(tab); setMobileDrawer(false); }}
              collapsed={sidebarCollapsed}
              onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              onShowMembers={() => setMembersOpen(true)}
            />
          </div>

          {/* Main content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile tab bar */}
            <div className="flex lg:hidden border-b border-border bg-card">
              <button
                onClick={() => setMobileDrawer(true)}
                className="px-3 py-2.5 text-muted-foreground hover:text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              {(["chat", "kanban"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "chat" ? "Chat" : "Kanban"}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden">
              {activeTab === "chat" ? (
                <ChatPanel initialMessages={project.chatMessages} />
              ) : (
                <div className="p-4 lg:p-6 overflow-y-auto h-full">
                  <KanbanBoard initialTasks={project.tasks} members={project.members} />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <MembersModal
        open={membersOpen}
        onOpenChange={setMembersOpen}
        members={project.members}
      />
    </div>
  );
};

export default ProjectWorkspacePage;
