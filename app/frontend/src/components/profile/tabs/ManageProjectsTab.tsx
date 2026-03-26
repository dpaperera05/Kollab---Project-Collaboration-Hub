import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Eye, Pencil, Trash2, Users, ExternalLink, FolderOpen } from "lucide-react";
import ApplicantsModal from "./ApplicantsModal";
import { apiDelete, apiGet, apiPatch } from "@/lib/api";

type Applicant = {
  id: string;
  name: string;
  role: string;
  motivation?: string;
  links?: { github?: string; linkedin?: string };
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
};

type OwnedProject = {
  _id: string;
  title: string;
  status: "Open" | "Ongoing" | "Filled" | "Finished";
  roles: string[];
  postedAt: string;
  applicants: Applicant[];
};

type JoinedProject = {
  _id: string;
  title: string;
  ownerId?: string;
  role?: string;
  status: "Open" | "Ongoing" | "Filled" | "Finished";
};

const STATUS_COLORS: Record<string, string> = {
  Open: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Ongoing: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  Filled: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  Finished: "bg-muted text-muted-foreground border-border",
};

const ManageProjectsTab = () => {
  const navigate = useNavigate();
  const [owned, setOwned] = useState<OwnedProject[]>([]);
  const [joined, setJoined] = useState<JoinedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicantsProject, setApplicantsProject] = useState<OwnedProject | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const ownedRes = await apiGet<{ success: boolean; data: { projects: OwnedProject[] } }>("/projects/owned");
        const joinedRes = await apiGet<{ success: boolean; data: { projects: JoinedProject[] } }>("/projects/joined");
        setOwned(ownedRes?.data?.projects || []);
        setJoined(joinedRes?.data?.projects || []);
      } catch (error) {
        console.error(error);
        toast({ title: "Failed to load projects", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const deleteProject = (id: string) => {
    apiDelete(`/projects/${id}`)
      .then(() => {
        setOwned(prev => prev.filter(p => p._id !== id));
        toast({ title: "Project deleted" });
      })
      .catch(() => toast({ title: "Could not delete", variant: "destructive" }));
  };

  const changeStatus = (id: string, status: string) => {
    apiPatch(`/projects/${id}/status`, { status })
      .then(() => {
        setOwned(prev => prev.map(p => p._id === id ? { ...p, status: status as OwnedProject["status"] } : p));
        toast({ title: `Status updated to ${status}` });
      })
      .catch(() => toast({ title: "Could not update status", variant: "destructive" }));
  };

  const leaveProject = (id: string) => {
    apiDelete(`/projects/${id}/members/me`)
      .then(() => {
        setJoined(prev => prev.filter(p => p._id !== id));
        toast({ title: "Left project" });
      })
      .catch(() => toast({ title: "Could not leave project", variant: "destructive" }));
  };

  const updateApplicant = (applicantId: string, status: "approved" | "rejected", reason?: string) => {
    const projectId = applicantsProject?._id || owned.find(p => p.applicants.some(a => a.id === applicantId))?._id;
    if (!projectId) return;
    apiPatch<{ success: boolean; data: { project: OwnedProject } }>(`/projects/${projectId}/applicants/${applicantId}`, { status, rejectionReason: reason })
      .then(res => {
        const updated = res?.data?.project;
        if (updated) {
          setOwned(prev => prev.map(p => p._id === updated._id ? updated : p));
          setApplicantsProject(prev => prev && prev._id === updated._id ? updated : prev);
        }
      })
      .catch(() => toast({ title: "Could not update applicant", variant: "destructive" }));
  };

  return (
    <div className="space-y-8">
      {/* Owned */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">Owned Projects</h3>
        {loading ? (
          <Card className="border-border card-shadow"><CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent></Card>
        ) : owned.length === 0 ? (
          <Card className="border-border card-shadow"><CardContent className="py-12 text-center text-muted-foreground">
            <FolderOpen size={32} className="mx-auto mb-3 opacity-50" /><p>No projects created yet.</p>
            <Button className="mt-4" onClick={() => navigate("/projects/new")}>Create a Project</Button>
          </CardContent></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {owned.map(p => (
              <Card key={p._id} className="border-border card-shadow hover:card-shadow-hover transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-foreground leading-tight">{p.title}</h4>
                    <Badge variant="outline" className={STATUS_COLORS[p.status]}>{p.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{p.roles.length} roles</span><span>•</span>
                    <span>{new Date(p.postedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => navigate(`/projects/${p._id}`)}><Eye size={12} /> View</Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => toast({ title: "Edit coming soon" })}><Pencil size={12} /> Edit</Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setApplicantsProject(p)}>
                      <Users size={12} /> Applicants ({p.applicants.length})
                    </Button>
                    <Select value={p.status} onValueChange={v => changeStatus(p._id, v)}>
                      <SelectTrigger className="h-8 text-xs w-auto min-w-[100px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Open", "Ongoing", "Filled", "Finished"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => navigate(`/projects/${p._id}/workspace`)}><ExternalLink size={12} /> Workspace</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 size={12} /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete project?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteProject(p._id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
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
        {loading ? (
          <Card className="border-border card-shadow"><CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent></Card>
        ) : joined.length === 0 ? (
          <Card className="border-border card-shadow"><CardContent className="py-12 text-center text-muted-foreground">
            <FolderOpen size={32} className="mx-auto mb-3 opacity-50" /><p>You haven't joined any projects yet.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/projects")}>Browse Projects</Button>
          </CardContent></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {joined.map(j => (
              <Card key={j._id} className="border-border card-shadow">
                <CardContent className="p-5 space-y-3">
                  <h4 className="font-semibold text-foreground">{j.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {j.ownerId && <span>Owner: {j.ownerId}</span>}
                    {j.role && <Badge variant="secondary" className="text-xs">{j.role}</Badge>}
                    <Badge variant="outline" className={STATUS_COLORS[j.status]}>{j.status}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => navigate(`/projects/${j._id}`)}><Eye size={12} /> View</Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => navigate(`/projects/${j._id}/workspace`)}><ExternalLink size={12} /> Workspace</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive hover:bg-destructive/10">Leave</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Leave project?</AlertDialogTitle><AlertDialogDescription>You can rejoin later if open.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => leaveProject(j._id)} className="bg-destructive text-destructive-foreground">Leave</AlertDialogAction>
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

      {/* Applicants Modal */}
      {applicantsProject && (
        <ApplicantsModal
          open={!!applicantsProject}
          onOpenChange={open => { if (!open) setApplicantsProject(null); }}
          projectTitle={applicantsProject.title}
          applicants={applicantsProject.applicants}
          onUpdateApplicant={updateApplicant}
        />
      )}
    </div>
  );
};

export default ManageProjectsTab;
