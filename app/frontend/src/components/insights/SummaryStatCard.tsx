import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: boolean;
}

const SummaryStatCard = ({ label, value, icon: Icon, accent }: SummaryStatCardProps) => (
  <Card
    className={cn(
      "p-5 flex items-center gap-4 border transition-shadow hover:shadow-md",
      accent && "border-primary/20 bg-primary/[0.03]"
    )}
  >
    <div
      className={cn(
        "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center",
        accent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}
    >
      <Icon size={20} />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
      <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">{label}</p>
    </div>
  </Card>
);

export default SummaryStatCard;
