import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-primary">
          アイボウくん
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          <Link href="/help">FAQ</Link>
          <Link href="/privacy">プライバシー</Link>
          <Link href="/terms">利用規約</Link>
        </nav>
        <Button asChild size="sm">
          <Link href="/api/auth/signin">ログイン</Link>
        </Button>
      </div>
    </header>
  );
}
