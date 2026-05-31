"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ErrorFallbackProps = {
  reset?: () => void;
};

export function ErrorFallback({ reset }: ErrorFallbackProps) {
  return (
    <Card>
      <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-danger/10 text-danger">
          <AlertTriangle className="size-5" />
        </span>
        <div className="space-y-1">
          <h2 className="text-base font-semibold">表示できませんでした</h2>
          <p className="text-sm text-muted-foreground">時間をおいてもう一度お試しください。</p>
        </div>
        {reset ? <Button onClick={reset}>再読み込み</Button> : null}
      </CardContent>
    </Card>
  );
}
