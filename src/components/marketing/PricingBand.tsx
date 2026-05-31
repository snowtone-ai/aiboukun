import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  { name: "Starter", price: "9,800円", items: ["1店舗", "口コミ返信案", "月次レポート"] },
  { name: "Growth", price: "19,800円〜", items: ["複数店舗", "競合比較", "低評価アラート"] },
];

export function PricingBand() {
  return (
    <section className="border-y bg-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-semibold">料金</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-lg border bg-background p-6">
              <p className="text-sm font-medium text-primary">{plan.name}</p>
              <p className="mt-2 text-3xl font-semibold">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground"> / 月</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" asChild>
                <Link href="/api/auth/signin">始める</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
