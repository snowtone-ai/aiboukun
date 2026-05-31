"use client";

import { ErrorFallback } from "@/components/ui/ErrorFallback";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl">
      <ErrorFallback reset={reset} />
    </div>
  );
}
