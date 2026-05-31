import { Badge } from "@/components/ui/badge";
import { riskLevelLabel } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function RiskBadge({ level }: { level: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full",
        level === "NORMAL" && "bg-muted text-muted-foreground",
        level === "ATTENTION" && "bg-warning/10 text-warning",
        level === "URGENT" && "bg-danger/10 text-danger",
        ["LEGAL", "MEDICAL", "PRIVACY", "SAFETY"].includes(level) && "bg-danger text-white",
      )}
    >
      {riskLevelLabel[level] ?? level}
    </Badge>
  );
}
