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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMemberSession } from "@/lib/auth";

const plans = [
  {
    name: "Member Free",
    badge: "Untuk coba dulu",
    price: "Rp 0",
    cadence: "/selamanya",
    description: "Cocok untuk kenalan dengan Chef AI sebelum upgrade.",
    highlights: [
      "2 kali penggunaan Chef AI setiap 7 hari",
      "1 request resep per bulan",
      "Tetap bisa akses resep publik Dapur Ardya",
      "Bisa simpan resep favorit",
    ],
    ctaLabel: "Tetap di Paket Free",
    ctaHref: "/member",
    featured: false,
  },
  {
    name: "Chef AI Premium",
    badge: "Paling direkomendasikan",
    price: "Rp 29.000",
    cadence: "/minggu",
    description: "Untuk yang sering masak dan ingin rekomendasi AI lebih leluasa kapan saja.",
    highlights: [
      "Akses Chef AI tanpa batas mingguan",
      "Request resep tanpa batas",
      "Prioritas untuk eksplor ide menu dari bahan sisa",
      "Alur upgrade sederhana via QRIS manual",
    ],
    ctaLabel: "Bayar via QR Sekarang",
    ctaHref: "#foto-qr",
    featured: true,
  },
];

const valuePoints = [
  "Rekomendasi resep dari bahan yang kamu punya di rumah",
  "Cocok untuk meal prep, masak harian, dan ide cepat saat bingung",
  "Tetap memakai tampilan resep Dapur Ardya yang sederhana dan mudah diikuti",
];

const faqs = [
  {
    question: "Bagaimana cara upgrade sekarang?",
    answer:
      "Untuk sementara upgrade masih manual. Scan QR code yang tersedia, lakukan pembayaran, lalu kirim bukti transfer ke admin agar paket premium diaktifkan.",
  },
  {
    question: "Apakah sudah terhubung payment gateway?",
    answer:
      "Belum. Halaman ini sengaja dibuat transparan sesuai kondisi saat ini. Begitu payment gateway aktif, alur ini bisa diganti tanpa mengubah pengalaman utama pengguna.",
  },
  {
    question: "Apa bedanya member free dan premium?",
    answer:
      "Member free mendapat 2 kali penggunaan Chef AI setiap 7 hari dan 1 request resep per bulan. Member premium mendapatkan akses Chef AI dan request resep tanpa batas.",
  },
  {
    question: "Setelah bayar, kapan akun saya di-upgrade?",
    answer:
      "Begitu admin menerima dan memverifikasi bukti pembayaran, status akun akan diperbarui ke paket premium. Karena masih manual, prosesnya tidak instan seperti payment gateway.",
  },
];

export default async function MemberUpgradePage() {
  const session = await getMemberSession();
  const payerName = session?.name?.trim() || "saya";
  const whatsappMessage = `Halo admin Dapur Ardya, saya ${payerName} sudah melakukan pembayaran untuk upgrade akun dengan bukti sebagai berikut.`;
  const whatsappHref = `https://wa.me/62895326880773?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(201,66,133,0.18),transparent_60%)]" />

      <div className="container relative mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <Link
          href="/member"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Member Area
        </Link>

        <section className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-primary">
            <Sparkles className="size-3.5" />
            Upgrade Chef AI
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Paket Premium yang
            <span className="block text-primary">lebih pas untuk ritme masak harian</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            Kami adaptasi halaman upgrade ini khusus untuk Dapur Ardya: lebih hangat, lebih jelas, dan jujur
            dengan kondisi saat ini. Belum ada payment gateway, jadi pembayaran dilakukan manual melalui QR code
            yang aman dan mudah di-scan.
          </p>

          <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
            {valuePoints.map((point) => (
              <div
                key={point}
                className="rounded-2xl border border-primary/15 bg-background/90 px-4 py-4 text-sm text-muted-foreground shadow-sm"
              >
                <div className="mb-3 inline-flex rounded-full bg-primary/10 p-2 text-primary">
                  <BadgeCheck className="size-4" />
                </div>
                <p>{point}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-5 md:grid-cols-2">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`relative flex h-full flex-col rounded-[2rem] border bg-card p-6 shadow-[0_18px_50px_-28px_rgba(48,20,40,0.4)] ${
                  plan.featured
                    ? "border-primary/35 ring-2 ring-primary/15"
                    : "border-border/80"
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
                    <span className="text-4xl font-black tracking-tight text-foreground">{plan.price}</span>
                    <span className="pb-1 text-sm text-muted-foreground">{plan.cadence}</span>
                  </div>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
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
                  {plan.ctaHref.startsWith("#") ? (
                    <a href={plan.ctaHref} className="block">
                      <Button
                        variant={plan.featured ? "default" : "outline"}
                        className={`h-12 w-full rounded-2xl text-sm font-bold ${
                          plan.featured ? "shadow-lg" : ""
                        }`}
                      >
                        {plan.ctaLabel}
                      </Button>
                    </a>
                  ) : (
                    <Link href={plan.ctaHref} className="block">
                      <Button
                        variant={plan.featured ? "default" : "outline"}
                        className={`h-12 w-full rounded-2xl text-sm font-bold ${
                          plan.featured ? "shadow-lg" : ""
                        }`}
                      >
                        {plan.ctaLabel}
                      </Button>
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>

          <aside
            id="pembayaran"
            className="rounded-[2rem] border border-primary/25 bg-card p-6 shadow-[0_18px_50px_-28px_rgba(48,20,40,0.45)]"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <QrCode className="size-3.5" />
              Pembayaran Manual
            </div>
            <h2 className="mt-4 text-2xl font-bold text-foreground">Scan QR untuk upgrade premium</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Karena belum memakai payment gateway, pembayaran masih dilakukan manual. Setelah transfer, kirim
              bukti pembayaran agar paket premium bisa kami aktifkan.
            </p>

            <div className="mt-6 rounded-[1.5rem] border border-primary/15 bg-background p-4">
              <div
                id="foto-qr"
                className="scroll-mt-24 overflow-hidden rounded-[1.25rem] border border-border bg-white p-3"
              >
                <Image
                  src="/qrcode.jpeg"
                  alt="QR code pembayaran upgrade Chef AI Dapur Ardya"
                  width={800}
                  height={800}
                  className="h-auto w-full rounded-2xl object-cover"
                  priority
                />
              </div>
              <div className="mt-4 rounded-2xl bg-primary/5 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Nominal yang disarankan</p>
                <p className="mt-1">Chef AI Premium: Rp 29.000 per minggu</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3">
                <Clock3 className="mt-0.5 size-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Konfirmasi setelah bayar</p>
                  <p className="text-sm text-muted-foreground">
                    Simpan bukti pembayaran, lalu kirimkan ke admin agar paket premium diaktifkan secara manual.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3">
                <ShieldCheck className="mt-0.5 size-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Transparan dan sementara</p>
                  <p className="text-sm text-muted-foreground">
                    Begitu sistem payment gateway siap, alur ini akan kami upgrade tanpa mengubah pengalaman utama.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-dashed border-primary/25 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <MessageCircleMore className="mt-0.5 size-4 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Butuh bantuan verifikasi?</p>
                  <p className="text-sm text-muted-foreground">
                    Setelah bayar, hubungi admin Dapur Ardya melalui channel yang biasa dipakai tim untuk aktivasi.
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Kalimat pembuka yang disarankan</p>
                <p className="mt-2 leading-6">
                  {whatsappMessage}
                </p>
              </div>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-4 block"
              >
                <Button className="h-12 w-full rounded-2xl bg-[#25D366] text-sm font-bold text-white shadow-lg hover:bg-[#1fb45a]">
                  <MessageCircleMore className="mr-2 size-4" />
                  Konfirmasi via WhatsApp
                  <ExternalLink className="ml-2 size-4" />
                </Button>
              </a>
            </div>
          </aside>
        </section>

        <section className="mt-14 rounded-[2rem] border border-primary/15 bg-card px-5 py-6 shadow-sm sm:px-8 sm:py-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black tracking-tight text-foreground">Pertanyaan yang sering muncul</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Kami buat bagian ini supaya alur upgrade tetap terasa jelas walaupun sistem pembayaran otomatis belum
              diaktifkan.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-border/80 bg-background px-5 py-4 shadow-sm"
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
