import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function KpiCard({ title, value, note, icon: Icon }: { title: string; value: string; note: string; icon: LucideIcon }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{note}</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
