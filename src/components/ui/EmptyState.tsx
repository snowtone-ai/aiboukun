import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({ icon: Icon, title, description, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
        {Icon ? (
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
        ) : null}
        <div className="space-y-1">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {actionHref && actionLabel ? (
          <Button asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
