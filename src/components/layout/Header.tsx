"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
import { StoreSwitcher } from "./StoreSwitcher";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full md:hidden" aria-label="メニュー">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>ナビゲーション</SheetTitle>
            </SheetHeader>
            <Sidebar mobile />
          </SheetContent>
        </Sheet>
        <Link href="/app" className="flex items-center gap-2 md:hidden">
          <span className="flex size-8 items-center justify-center rounded-2xl bg-primary text-xs font-bold text-primary-foreground">
            相
          </span>
          <span className="font-semibold">アイボウくん</span>
        </Link>
        <StoreSwitcher />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="hidden h-10 rounded-full text-muted-foreground md:inline-flex">
          <Search className="size-4" />
          Cmd K
        </Button>
        <NotificationBell />
        <Avatar className="size-9 border">
          <AvatarFallback>店</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
