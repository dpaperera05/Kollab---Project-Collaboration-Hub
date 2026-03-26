import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Eye, LogOut, Trash2, Lock } from "lucide-react";
import { type KollabUser, logout } from "@/lib/authStore";
import { setProfilePublic, changePassword, deleteAccount } from "@/lib/profileStore";

interface Props { user: KollabUser; onUpdate: () => void; }

const SettingsTab = ({ user, onUpdate }: Props) => {
  const navigate = useNavigate();
  const [isPublic, setIsPublic] = useState(user.isProfilePublic ?? true);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  useEffect(() => {
    setIsPublic(user.isProfilePublic ?? true);
  }, [user.isProfilePublic]);

  const toggleVisibility = async (next: boolean) => {
    if (updatingVisibility) return;
    setIsPublic(next);
    setUpdatingVisibility(true);
    const result = await setProfilePublic(next);
    setUpdatingVisibility(false);

    if (result.success) {
      toast({ title: `Profile set to ${next ? "Public" : "Private"}` });
      onUpdate();
    } else {
      setIsPublic(!next);
      toast({ title: result.error || "Failed to update visibility", variant: "destructive" });
    }
  };

  const handleChangePassword = () => {
    if (!currentPw || !newPw) { toast({ title: "Fill all fields", variant: "destructive" }); return; }
    if (newPw !== confirmPw) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    if (newPw.length < 6) { toast({ title: "Password must be 6+ characters", variant: "destructive" }); return; }
    const result = changePassword(currentPw, newPw);
    if (result.success) {
      toast({ title: "Password changed" });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      onUpdate();
    } else {
      toast({ title: result.error!, variant: "destructive" });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleDeleteAccount = async () => {
    const result = await deleteAccount();
    if (result.success) {
      toast({ title: "Account deleted" });
      navigate("/login", { replace: true });
    } else {
      toast({ title: result.error || "Failed to delete account", variant: "destructive" });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Visibility */}
      <Card className="border-border card-shadow">
        <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><Eye size={16} /> Profile Visibility</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{isPublic ? "Public" : "Private"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isPublic ? "Your profile is visible to others" : "Your profile is hidden from listings"}
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={toggleVisibility} disabled={updatingVisibility} />
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-border card-shadow">
        <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><Lock size={16} /> Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Current Password</Label><Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} /></div>
          <div><Label>New Password</Label><Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} /></div>
          <div><Label>Confirm New Password</Label><Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} /></div>
          <Button onClick={handleChangePassword} className="w-full">Update Password</Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="border-border card-shadow">
        <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><LogOut size={16} /> Session</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Sign out of your current session.</p>
          <Button variant="outline" onClick={handleLogout} className="gap-2 w-full"><LogOut size={14} /> Logout</Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border border-destructive/20 card-shadow">
        <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2 text-destructive"><Trash2 size={16} /> Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 w-full text-destructive border-destructive/30 hover:bg-destructive/10"><Trash2 size={14} /> Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently remove your profile, projects, and all data. This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">Delete Forever</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
