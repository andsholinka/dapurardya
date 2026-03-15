"use client";

import { useState } from "react";
import { Check, Crown, Star, Coins, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalLoading } from "./LoadingProvider";

const plans = [
  {
    id: "starter",
    name: "Starter",
    badge: "Paling Murah",
    price: "Rp 15.000",
    credits: 10,
    cadence: "/10 Credits",
    description: "Cocok untuk yang ingin mencoba fitur AI secara santai.",
    highlights: [
      "10 Credits siap pakai",
      "Tanpa batas waktu (selamanya)",
      "Bebas pakai untuk Chef AI",
      "Bebas pakai untuk Request Resep",
    ],
    ctaLabel: "Top Up 10 Credits",
    featured: false,
  },
  {
    id: "basic",
    name: "Basic",
    badge: "Paling Populer",
    price: "Rp 25.000",
    credits: 25,
    cadence: "/25 Credits",
    description: "Pilihan terbaik untuk ritme masak harian keluarga.",
    highlights: [
      "25 Credits siap pakai",
      "Lebih hemat Rp 12.500",
      "Tanpa batas waktu",
      "Bebas pakai untuk semua fitur",
      "Prioritas update resep",
    ],
    ctaLabel: "Top Up 25 Credits",
    featured: true,
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Value Terbaik",
    price: "Rp 40.000",
    credits: 50,
    cadence: "/50 Credits",
    description: "Untuk pecinta masak yang ingin eksplorasi tanpa ragu.",
    highlights: [
      "50 Credits siap pakai",
      "Hemat besar (Hanya Rp 800/credit)",
      "Tanpa batas waktu",
      "Akses fitur prioritas",
      "Dukungan penuh tim dapur",
    ],
    ctaLabel: "Top Up 50 Credits",
    featured: false,
  },
];

export function TopUpPlans({ memberEmail }: { memberEmail?: string }) {
  const { setIsLoading } = useGlobalLoading();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleTopUp(planId: string) {
    if (!memberEmail) {
      window.location.href = "/member/auth?tab=login";
      return;
    }

    setLoadingId(planId);
    setIsLoading(true);

    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: planId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat link pembayaran");

      // Redirect to Mayar checkout
      window.location.href = data.url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoadingId(null);
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <article
          key={plan.id}
          className={`relative flex h-full flex-col rounded-[2rem] border bg-card p-6 shadow-[0_18px_50px_-28px_rgba(48,20,40,0.4)] transition-all hover:translate-y-[-4px] ${
            plan.featured ? "border-primary/35 ring-2 ring-primary/15" : "border-border/80"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {plan.featured ? <Crown className="size-3.5" /> : <Star className="size-3.5" />}
                {plan.badge}
              </div>
              <h2 className="mt-4 text-2xl font-bold text-foreground">{plan.name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.description}</p>
            </div>
          </div>

          <div className="mt-8 border-y border-border/70 py-6">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black tracking-tight text-foreground">
                {plan.price}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">{plan.cadence}</span>
            </div>
          </div>

          <ul className="mt-6 space-y-3 text-sm text-muted-foreground flex-1">
            {plan.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-3">
                <span className="mt-0.5 rounded-full bg-primary/10 p-1 text-primary">
                  <Check className="size-3.5" />
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Button
              onClick={() => handleTopUp(plan.id)}
              disabled={!!loadingId}
              variant={plan.featured ? "default" : "outline"}
              className={`h-12 w-full rounded-2xl text-sm font-bold shadow-lg ${
                plan.featured ? "shadow-primary/20" : ""
              }`}
            >
              {loadingId === plan.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Coins className="mr-2 h-4 w-4" />
              )}
              {plan.ctaLabel}
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
