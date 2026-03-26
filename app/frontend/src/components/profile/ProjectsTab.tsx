import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Eye, Pencil, Trash2, Users, ExternalLink, FolderOpen } from "lucide-react";
import { type KollabUser } from "@/lib/authStore";
import { getLocalProjects } from "@/lib/localProjects";
import { getJoinedProjects, leaveProject } from "@/lib/profileStore";
import { mockProjects, type Project, type ProjectStatus } from "@/data/mockProjects";

interface Props { user: KollabUser; }

const STATUS_COLORS: Record<ProjectStatus, string> = {
  Open: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Ongoing: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  Filled: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  Finished: "bg-muted text-muted-foreground border-border",
};

const ProjectsTab = ({ user }: Props) => {
  const navigate = useNavigate();
  const [, setRefresh] = useState(0);
  const owned = getLocalProjects().filter(p => p.owner.id === user.id);
  const joinedRefs = getJoinedProjects(user.id);
  const allProjects = [...getLocalProjects(), ...mockProjects];
  const joined = joinedRefs.map(j => ({ ...j, project: allProjects.find(p => p.id === j.projectId) })).filter(j => j.project);

  const handleDelete = (id: string) => {
    const key = "kollab_projects_created";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify(existing.filter((p: Project) => p.id !== id)));
    setRefresh(r => r + 1);
    toast({ title: "Project deleted" });
  };

  const handleStatusChange = (id: string, status: ProjectStatus) => {
    const key = "kollab_projects_created";
    const existing: Project[] = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify(existing.map(p => p.id === id ? { ...p, status } : p)));
    setRefresh(r => r + 1);
    toast({ title: `Status updated to ${status}` });
  };

  const handleLeave = (projectId: string) => {
    leaveProject(user.id, projectId);
    setRefresh(r => r + 1);
    toast({ title: "Left project" });
  };

  return (
    <div className="space-y-8">
      {/* Owned */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">Owned Projects</h3>
        {owned.length === 0 ? (
          <Card className="border-border card-shadow">
            <CardContent className="py-12 text-center text-muted-foreground">
              <FolderOpen size={32} className="mx-auto mb-3 opacity-50" />
              <p>No projects created yet.</p>
              <Button className="mt-4" onClick={() => navigate("/projects/new")}>Create a Project</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {owned.map(p => (
              <Card key={p.id} className="border-border card-shadow hover:card-shadow-hover transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-foreground leading-tight">{p.title}</h4>
                    <Badge variant="outline" className={STATUS_COLORS[p.status]}>{p.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{p.roles.length} roles</span>
                    <span>•</span>
                    <span>{new Date(p.postedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => navigate(`/projects/${p.id}`)}><Eye size={12} /> View</Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => toast({ title: "Edit page coming soon" })}><Pencil size={12} /> Edit</Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => toast({ title: "Applicants view coming soon" })}><Users size={12} /> Applicants</Button>
                    <Select value={p.status} onValueChange={(v) => handleStatusChange(p.id, v as ProjectStatus)}>
                      <SelectTrigger className="h-8 text-xs w-auto min-w-[100px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(["Open", "Ongoing", "Filled", "Finished"] as ProjectStatus[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 size={12} /> Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete project?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Joined */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">Joined Projects</h3>
        {joined.length === 0 ? (
          <Card className="border-border card-shadow">
            <CardContent className="py-12 text-center text-muted-foreground">
              <FolderOpen size={32} className="mx-auto mb-3 opacity-50" />
              <p>You haven't joined any projects yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/projects")}>Browse Projects</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {joined.map(j => (
              <Card key={j.projectId} className="border-border card-shadow">
                <CardContent className="p-5 space-y-3">
                  <h4 className="font-semibold text-foreground">{j.project!.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">{j.role}</Badge>
                    <Badge variant="outline" className={STATUS_COLORS[j.project!.status]}>{j.project!.status}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => navigate(`/projects/${j.projectId}`)}><Eye size={12} /> View</Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => toast({ title: "Workspace coming soon" })}><ExternalLink size={12} /> Workspace</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive hover:bg-destructive/10">Leave</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Leave project?</AlertDialogTitle>
                          <AlertDialogDescription>You can rejoin later if the role is still open.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleLeave(j.projectId)} className="bg-destructive text-destructive-foreground">Leave</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProjectsTab;
