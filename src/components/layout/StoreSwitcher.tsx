"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type StoreSwitcherProps = {
  stores?: Array<{ id: string; name: string; brand?: { name: string } | null; area?: { name: string } | null }>;
};

export function StoreSwitcher({ stores = [] }: StoreSwitcherProps) {
  const [items, setItems] = useState(stores);

  useEffect(() => {
    if (stores.length) {
      return;
    }
    let active = true;
    fetch("/api/stores")
      .then((response) => response.json())
      .then((payload: { ok: boolean; data?: StoreSwitcherProps["stores"] }) => {
        if (active && payload.ok && payload.data) {
          setItems(payload.data);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [stores]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="hidden h-10 min-w-52 justify-start rounded-full text-muted-foreground md:inline-flex">
          <Store className="size-4" />
          全店舗
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>店舗切替</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app/stores">全店舗ダッシュボード</Link>
        </DropdownMenuItem>
        {items.map((store) => (
          <DropdownMenuItem key={store.id} asChild>
            <Link href={`/app/reviews?storeId=${store.id}`}>
              <span className="truncate">
                {store.brand?.name ? `${store.brand.name} / ` : ""}
                {store.area?.name ? `${store.area.name} / ` : ""}
                {store.name}
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
