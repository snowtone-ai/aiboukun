import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ReviewFilterBarProps = {
  q?: string;
  rating?: string;
  replyStatus?: string;
};

export function ReviewFilterBar({ q, rating, replyStatus }: ReviewFilterBarProps) {
  return (
    <form className="grid gap-2 rounded-2xl border bg-card p-3 md:grid-cols-[1fr_140px_160px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" defaultValue={q} placeholder="口コミを検索" className="pl-9" />
      </div>
      <select name="ratings" defaultValue={rating ?? ""} className="h-10 rounded-full border bg-background px-3 text-sm">
        <option value="">星すべて</option>
        <option value="1,2,3">星1-3</option>
        <option value="4,5">星4-5</option>
      </select>
      <select name="replyStatus" defaultValue={replyStatus ?? ""} className="h-10 rounded-full border bg-background px-3 text-sm">
        <option value="">返信状態すべて</option>
        <option value="UNREPLIED">未返信</option>
        <option value="DRAFTED">下書き</option>
        <option value="APPROVED">承認済み</option>
        <option value="POSTED">投稿済み</option>
      </select>
      <Button type="submit">絞り込み</Button>
    </form>
  );
}
