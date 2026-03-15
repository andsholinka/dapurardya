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
import { getMemberSession } from "@/lib/auth";

const plans = [
  {
    name: "Starter Credits",
    badge: "Paling Murah",
    price: "Rp 15.000",
    cadence: "/10 Credits",
    description: "Cocok untuk yang ingin mencoba fitur AI secara santai.",
    highlights: [
      "10 Credits siap pakai",
      "Tanpa batas waktu (selamanya)",
      "Bebas pakai untuk Chef AI",
      "Bebas pakai untuk Request Resep",
    ],
    ctaLabel: "Ambil 10 Credits",
    ctaHref: "#foto-qr",
    featured: false,
  },
  {
    name: "Basic Credits",
    badge: "Paling Populer",
    price: "Rp 25.000",
    cadence: "/25 Credits",
    description: "Pilihan terbaik untuk ritme masak harian keluarga.",
    highlights: [
      "25 Credits siap pakai",
      "Lebih hemat Rp 12.500",
      "Tanpa batas waktu",
      "Bebas pakai untuk semua fitur",
      "Prioritas update resep",
    ],
    ctaLabel: "Ambil 25 Credits",
    ctaHref: "#foto-qr",
    featured: true,
  },
  {
    name: "Pro Credits",
    badge: "Value Terbaik",
    price: "Rp 40.000",
    cadence: "/50 Credits",
    description: "Untuk pecinta masak yang ingin eksplorasi tanpa ragu.",
    highlights: [
      "50 Credits siap pakai",
      "Hemat besar (Hanya Rp 800/credit)",
      "Tanpa batas waktu",
      "Akses fitur prioritas",
      "Dukungan penuh tim dapur",
    ],
    ctaLabel: "Ambil 50 Credits",
    ctaHref: "#foto-qr",
    featured: false,
  },
];

const valuePoints = [
  "Rekomendasi resep dari bahan yang kamu punya di rumah",
  "Cocok untuk meal prep, masak harian, dan ide cepat saat bingung",
  "Tetap memakai tampilan resep Dapur Ardya yang sederhana dan mudah diikuti",
];

const faqs = [
  {
    question: "Bagaimana cara isi credits sekarang?",
    answer:
      "Untuk sementara isi credits masih manual. Scan QR code yang tersedia, lakukan pembayaran, lalu kirim bukti transfer ke admin agar credits segera ditambahkan ke akun Anda.",
  },
  {
    question: "Apakah sudah terhubung payment gateway?",
    answer:
      "Belum. Halaman ini sengaja dibuat transparan sesuai kondisi saat ini. Begitu payment gateway aktif, alur ini bisa diganti tanpa mengubah pengalaman utama pengguna.",
  },
  {
    question: "Bagaimana jika credit awal saya habis?",
    answer:
      "Member baru otomatis mendapatkan 3 Credits di awal secara gratis. Jika habis, Anda bisa melakukan Top Up paket Credits (Starter/Basic/Pro) untuk terus menggunakan fitur Chef AI dan Request Resep. Credits tidak akan hangus (selamanya).",
  },
  {
    question: "Setelah bayar, kapan Credits saya bertambah?",
    answer:
      "Begitu admin memverifikasi bukti pembayaran Anda, admin akan mengupdate jumlah Credits di akun Anda secara manual. Proses ini biasanya memakan waktu singkat setelah konfirmasi via WhatsApp.",
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
            <h2 className="mt-4 text-2xl font-bold text-foreground">Scan QR untuk Top Up Credits</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Karena belum memakai payment gateway, pembayaran masih dilakukan manual. Setelah transfer, kirim
              bukti pembayaran agar saldo credits bisa segera kami tambahkan ke akun Anda.
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
                <p className="font-semibold text-foreground">Daftar Harga Paket Credits</p>
                <ul className="mt-1 space-y-1">
                  <li>• Starter (10 Credits): Rp 15.000</li>
                  <li>• Basic (25 Credits): Rp 25.000</li>
                  <li>• Pro (50 Credits): Rp 40.000</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3">
                <Clock3 className="mt-0.5 size-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Konfirmasi setelah bayar</p>
                  <p className="text-sm text-muted-foreground">
                    Simpan bukti pembayaran, lalu kirimkan ke admin agar saldo credits Anda segera diupdate secara manual.
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
