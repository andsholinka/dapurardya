import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container max-w-md mx-auto px-4 py-24 text-center">
      <p className="text-6xl mb-4">🍳</p>
      <h1 className="text-3xl font-bold mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-muted-foreground mb-8">
        Sepertinya halaman yang kamu cari sudah dipindah atau tidak ada.
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Ke Beranda
        </Link>
        <Link
          href="/resep"
          className="px-5 py-2.5 rounded-xl border text-sm font-medium hover:bg-muted transition-colors"
        >
          Lihat Resep
        </Link>
      </div>
    </div>
  );
}
