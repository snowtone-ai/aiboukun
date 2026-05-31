import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AibouAvatar } from "./AibouAvatar";

type AibouMessageCardProps = {
  message: string;
  tone?: "normal" | "attention" | "danger";
  actionLabel?: string;
  children?: ReactNode;
};

export function AibouMessageCard({ message, tone = "normal", actionLabel, children }: AibouMessageCardProps) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="flex gap-4 p-5">
        <AibouAvatar status={tone === "normal" ? "normal" : tone} />
        <div className="min-w-0 flex-1 space-y-4">
          <p className="text-base leading-7 text-foreground">{message}</p>
          {children}
          {actionLabel ? (
            <Button className="rounded-full">
              {actionLabel}
              <ArrowRight className="size-4" />
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
