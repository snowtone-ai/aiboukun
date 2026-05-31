import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AppNotFound() {
  return (
    <div className="mx-auto max-w-3xl">
      <EmptyState
        icon={SearchX}
        title="見つかりませんでした"
        description="指定されたページやデータは存在しないか、表示権限がありません。"
      />
      <div className="mt-4 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/app">ホームへ戻る</Link>
        </Button>
      </div>
    </div>
  );
}
