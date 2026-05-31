import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-16 w-full" />
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}
