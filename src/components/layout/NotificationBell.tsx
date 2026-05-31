"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationList } from "@/components/notifications/NotificationList";

type NotificationBellProps = {
  unreadCount?: number;
};

export function NotificationBell({ unreadCount = 0 }: NotificationBellProps) {
  const [count, setCount] = useState(unreadCount);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="通知">
          <Bell className="size-5" />
          {count > 0 ? (
            <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {count > 9 ? "9+" : count}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>通知</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <NotificationList onUnreadChange={setCount} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
