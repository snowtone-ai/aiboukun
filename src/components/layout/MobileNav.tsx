"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, FileText, Home, MessageSquareText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileItems = [
  { href: "/app", label: "ホーム", icon: Home },
  { href: "/app/reviews", label: "口コミ", icon: MessageSquareText },
  { href: "/app/chat", label: "相談", icon: Bot, primary: true },
  { href: "/app/reports", label: "報告", icon: FileText },
  { href: "/app/settings", label: "設定", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t bg-card/95 px-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      {mobileItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground",
              active && "text-primary",
            )}
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full",
                item.primary && "bg-primary text-primary-foreground shadow-sm",
                active && !item.primary && "bg-accent-light/60",
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
