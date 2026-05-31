import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type ActionCardProps = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  count?: string;
};

export function ActionCard({ href, title, description, icon: Icon, count }: ActionCardProps) {
  return (
    <Link href={href}>
      <Card className="h-full transition hover:border-primary/30 hover:shadow-sm">
        <CardContent className="flex h-full items-start gap-4 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-light/60 text-primary">
            <Icon className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="font-semibold">{title}</span>
              {count ? <span className="text-sm font-semibold text-primary">{count}</span> : null}
            </span>
            <span className="mt-1 block text-sm leading-6 text-muted-foreground">{description}</span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
