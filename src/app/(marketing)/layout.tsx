import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MarketingNav } from "@/components/marketing/MarketingNav";

export const metadata: Metadata = {
  title: "アイボウくん | Googleマップ集客のAI相棒",
  description: "Google口コミ管理、低評価検知、競合比較、レポートを担当するAI相棒。",
  openGraph: {
    title: "アイボウくん",
    description: "月1万円でAI相棒を雇う。",
    images: ["/og-image.svg"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.svg"],
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MarketingNav />
      {children}
    </>
  );
}
