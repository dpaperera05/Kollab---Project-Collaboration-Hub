import { useEffect, useRef, useState } from "react";
import { Camera, Eye, Shield, MapPin, Clock, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { type KollabUser } from "@/lib/authStore";
import { setProfilePublic, uploadAvatar } from "@/lib/profileStore";

interface Props { user: KollabUser; onUpdate: () => void; }

const ProfileHeader = ({ user, onUpdate }: Props) => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPublic, setIsPublic] = useState(user.isProfilePublic ?? true);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const p = user.profile || {};
  const avatarSrc = p.avatarUrl || (p as any).avatar;

  useEffect(() => {
    setIsPublic(user.isProfilePublic ?? true);
  }, [user.isProfilePublic]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const result = await uploadAvatar(base64);
      if (result.success) {
        onUpdate();
        toast({ title: "Avatar updated" });
      } else {
        toast({ title: result.error || "Failed to upload avatar", variant: "destructive" });
      }
    };
    reader.readAsDataURL(file);
  };

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

  const initials = (p.name || user.email).slice(0, 2).toUpperCase();

  const viewPublicProfile = () => {
    const targetPath = user.userType === "mentor" ? `/mentors/${user.id}` : `/people/${user.id}`;
    navigate(targetPath);
  };

  return (
    <div className="relative mb-8 rounded-2xl border border-border bg-card overflow-hidden card-shadow">
      {/* Top accent bar */}
      <div className="h-1.5 w-full bg-primary" />

      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
              <AvatarImage src={avatarSrc} />
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 text-background opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera size={20} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground truncate">{p.name || "Unnamed"}</h1>
              <Badge className="capitalize text-xs" variant={user.userType === "mentor" ? "default" : "secondary"}>
                {user.userType}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 max-w-xl">{p.bio || "No bio yet."}</p>
            <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin size={12} />{p.location || "No location"}</span>
              <span className="flex items-center gap-1"><Clock size={12} />{p.timezone || "No timezone"}</span>
              <span>{user.email}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="flex items-center gap-2 text-sm">
              {isPublic ? <Eye size={14} className="text-primary" /> : <Shield size={14} className="text-muted-foreground" />}
              <span className="text-muted-foreground text-xs">{isPublic ? "Public" : "Private"}</span>
              <Switch checked={isPublic} onCheckedChange={toggleVisibility} disabled={updatingVisibility} />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={viewPublicProfile}>
              <ExternalLink size={12} /> View Public Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
