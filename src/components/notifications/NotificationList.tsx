"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTime } from "@/lib/formatters";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  status: string;
  actionUrl: string | null;
  createdAt: string;
};

export function NotificationList({ onUnreadChange }: { onUnreadChange?: (count: number) => void }) {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((response) => response.json())
      .then((payload: { ok: boolean; data?: NotificationItem[] }) => {
        if (payload.ok && payload.data) {
          setItems(payload.data);
          onUnreadChange?.(payload.data.filter((item) => item.status === "UNREAD").length);
        }
      })
      .catch(() => undefined);
  }, [onUnreadChange]);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    const next = items.map((item) => (item.id === id ? { ...item, status: "READ" } : item));
    setItems(next);
    onUnreadChange?.(next.filter((item) => item.status === "UNREAD").length);
  }

  if (!items.length) {
    return (
      <div className="flex min-h-32 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
        <Bell className="size-5" />
        通知はありません
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-96">
      <div className="space-y-2 p-1">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 leading-5 text-muted-foreground">{item.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
              </div>
              {item.status === "UNREAD" ? <span className="mt-1 size-2 rounded-full bg-primary" /> : null}
            </div>
            <div className="mt-2 flex gap-2">
              {item.actionUrl ? (
                <Button size="sm" variant="outline" asChild>
                  <Link href={item.actionUrl}>開く</Link>
                </Button>
              ) : null}
              {item.status === "UNREAD" ? (
                <Button size="sm" variant="ghost" onClick={() => markRead(item.id)}>
                  既読
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
