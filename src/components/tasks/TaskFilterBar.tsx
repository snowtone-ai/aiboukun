import { Button } from "@/components/ui/button";

export function TaskFilterBar({ status }: { status?: string }) {
  return (
    <form className="flex flex-wrap gap-2 rounded-2xl border bg-card p-3">
      <select name="status" defaultValue={status ?? ""} className="h-10 rounded-full border bg-background px-3 text-sm">
        <option value="">すべて</option>
        <option value="TODO">未着手</option>
        <option value="DOING">進行中</option>
        <option value="DONE">完了</option>
      </select>
      <Button type="submit">絞り込み</Button>
    </form>
  );
}
