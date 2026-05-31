import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ rating, compact = false }: { rating: number; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating}つ星`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(compact ? "size-3.5" : "size-4", star <= rating ? "fill-warning text-warning" : "text-muted-foreground/30")}
        />
      ))}
    </span>
  );
}
