import Link from "next/link";
import { BadgeCheck, ArrowRight, Sparkles, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TopUpSuccessPage() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[400px] bg-[radial-gradient(circle_at_center,rgba(255,148,168,0.15),transparent_70%)]" />
      
      <div className="container relative mx-auto max-w-lg px-4 text-center">
        <div className="inline-flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-8 animate-in zoom-in duration-500">
          <BadgeCheck className="size-10" />
        </div>
        
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          Pembayaran Berhasil!
        </h1>
        
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Terima kasih! Saldo credits kamu sedang diproses dan akan bertambah secara otomatis dalam beberapa saat.
        </p>

        <div className="mt-10 p-6 rounded-[2rem] border border-primary/20 bg-card shadow-xl">
           <div className="flex items-center justify-center gap-2 mb-4 text-primary font-bold">
              <Sparkles className="size-5" />
              <span>Sudah Siap Masak?</span>
           </div>
           <p className="text-sm text-muted-foreground mb-6">
              Kamu sekarang bisa menggunakan Chef AI untuk mencari ide resep dari bahan di kulkas atau request resep khusus ke tim Dapur Ardya.
           </p>
           <div className="flex flex-col gap-3">
              <Link href="/kulkas">
                <Button className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/20">
                   Gunakan Chef AI
                   <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <Link href="/member">
                <Button variant="outline" className="w-full h-12 rounded-2xl font-bold">
                   <Coins className="mr-2 size-4" />
                   Lihat Saldo Saya
                </Button>
              </Link>
           </div>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Jika saldo belum bertambah setelah 15 menit, silakan hubungi admin dengan melampirkan bukti pembayaran dari email kamu.
        </p>
      </div>
    </div>
  );
}
