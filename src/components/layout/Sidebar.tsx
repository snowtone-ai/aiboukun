"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen w-60 shrink-0 border-r bg-card px-3 py-4",
        mobile ? "block w-full" : "hidden md:sticky md:top-0 md:block",
      )}
    >
      <Link href="/app" className="mb-6 flex items-center gap-3 px-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
          相
        </span>
        <span className="text-lg font-semibold">アイボウくん</span>
      </Link>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                active && "bg-accent-light/50 text-primary",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
