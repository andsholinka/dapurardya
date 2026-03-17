import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Clock3,
  Crown,
  ExternalLink,
  MessageCircleMore,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth-v2";

import { TopUpPlans } from "@/components/TopUpPlans";

const valuePoints = [
  "Rekomendasi resep dari bahan yang kamu punya di rumah",
  "Cocok untuk meal prep, masak harian, dan ide cepat saat bingung",
  "Tetap memakai tampilan resep Dapur Ardya yang sederhana dan mudah diikuti",
];

const faqs = [
  {
    question: "Bagaimana cara melakukan pembayaran?",
    answer:
      "Kami menggunakan payment gateway Mayar.id. Anda bisa membayar menggunakan QRIS, GoPay, OVO, Dana, ShopeePay, Transfer Bank (Virtual Account), hingga Kartu Kredit secara otomatis.",
  },
  {
    question: "Apakah Credits saya langsung bertambah?",
    answer:
      "Ya! Begitu pembayaran Anda berhasil, sistem akan mendeteksi secara otomatis dan menambahkan saldo Credits ke akun Anda dalam hitungan detik.",
  },
  {
    question: "Apakah data pembayaran saya aman?",
    answer:
      "Aman. Semua transaksi diproses melalui Mayar.id yang sudah terverifikasi dan berizin resmi. Dapur Ardya tidak pernah menyimpan data pembayaran Anda.",
  },
  {
    question: "Bagaimana jika terjadi kendala saat bayar?",
    answer:
      "Jika saldo belum bertambah setelah pembayaran berhasil, silakan hubungi admin melalui WhatsApp dengan melampirkan bukti pembayaran yang masuk ke email Anda.",
  },
];

export default async function MemberUpgradePage() {
  const session = await getSession();

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(255,148,168,0.18),transparent_60%)]" />

      <div className="container relative mx-auto max-w-6xl px-4 py-8 sm:py-12">

        <section className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="size-3" />
            Simple Credit-Based Pricing
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Bayar Sesuai Kebutuhan
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            Beli kredit sekali, gunakan kapan saja. Tanpa biaya langganan, tanpa biaya bulanan.
            <span className="block text-primary font-semibold">Kredit tidak pernah hangus.</span>
          </p>
        </section>

        {/* Top Up Plans Component */}
        <section className="mt-12">
          <TopUpPlans memberEmail={session?.email} />
        </section>

        <section className="mt-20 grid gap-10 lg:grid-cols-2 lg:items-center">
           <div className="space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-foreground">Kenapa memakai Credits?</h2>
              <div className="space-y-4">
                 {valuePoints.map((point) => (
                    <div key={point} className="flex gap-4 items-start p-4 rounded-2xl bg-card border border-border/60">
                       <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <Check className="size-5" />
                       </div>
                       <p className="text-muted-foreground leading-relaxed">{point}</p>
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="rounded-[2.5rem] border-2 border-primary/20 bg-background/50 p-6 sm:p-10 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                    <ShieldCheck className="size-6" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold">Pembayaran Aman</h3>
                    <p className="text-sm text-muted-foreground">Powered by Mayar.id</p>
                 </div>
              </div>
              <p className="text-muted-foreground mb-8">
                Nikmati kemudahan top-up otomatis. Setelah konfirmasi pembayaran, Anda bisa langsung kembali mengeksplorasi resep bersama Chef AI.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl border bg-white/5 text-center">
                    <p className="text-2xl font-black text-primary">100%</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Otomatis</p>
                 </div>
                 <div className="p-4 rounded-2xl border bg-white/5 text-center">
                    <p className="text-2xl font-black text-primary">24/7</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Siap Pakai</p>
                 </div>
              </div>
           </div>
        </section>

        <section className="mt-20 rounded-[2rem] border border-primary/15 bg-card px-5 py-6 shadow-sm sm:px-8 sm:py-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black tracking-tight text-foreground">Pertanyaan yang sering muncul</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Semua yang perlu kamu ketahui tentang sistem credits dan pembayaran otomatis Mayar.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-border/80 bg-background px-5 py-4 shadow-sm transition-all open:ring-2 open:ring-primary/20"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-foreground">
                  {faq.question}
                  <span className="text-xl text-primary transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
