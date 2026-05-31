import type { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-8">{children}</main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
