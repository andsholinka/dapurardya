"use client";

import { useEffect, useState } from "react";
import { Wand2, Download, Loader2, ArrowLeft, ImageIcon, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface IconItem {
  id: string;
  url: string;
  prompt: string;
  perspective: string;
  createdAt: string;
}

export default function IconGalleryPage() {
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCopy(icon: IconItem) {
    try {
      const res = await fetch(icon.url);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopied(icon.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      alert("Browser tidak mendukung copy gambar.");
    }
  }

  useEffect(() => {
    fetch("/api/member/icon-studio/gallery")
      .then((r) => r.json())
      .then((d) => setIcons(d.icons || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleDownload(icon: IconItem, transparent: boolean) {
    setDownloading(icon.id + (transparent ? "-t" : ""));
    try {
      // Cloudinary: tambahkan e_background_removal untuk hapus background
      const url = transparent
        ? icon.url.replace("/upload/", "/upload/e_background_removal/")
        : icon.url;

      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `ardya-icon-${icon.prompt.slice(0, 20).replace(/\s+/g, "-")}-${transparent ? "transparent" : "original"}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      alert("Gagal download. Coba lagi.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/member/icon-studio" className="rounded-xl border-2 border-border p-2 hover:border-primary/50 transition-colors">
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Wand2 className="size-5 text-primary" />
              Galeri Icon
            </h1>
            <p className="text-xs text-muted-foreground">{icons.length} icon tersimpan</p>
          </div>
        </div>
        <Link href="/member/icon-studio">
          <Button size="sm" className="rounded-xl">
            <Wand2 className="size-3.5 mr-1.5" />
            Buat Baru
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="size-8 animate-spin text-primary/40" />
        </div>
      ) : icons.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4 text-muted-foreground">
          <ImageIcon className="size-16 opacity-20" />
          <p className="text-sm">Belum ada icon. Buat icon pertamamu!</p>
          <Link href="/member/icon-studio">
            <Button className="rounded-xl">Generate Icon</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {icons.map((icon) => (
            <div key={icon.id} className="group rounded-2xl border-2 border-border bg-card overflow-hidden hover:border-primary/30 transition-colors">
              <div className="relative aspect-square bg-muted/20">
                <Image src={icon.url} alt={icon.prompt} fill className="object-contain p-3" unoptimized />
              </div>
              <div className="p-3">
                <p className="text-xs font-medium truncate mb-1" title={icon.prompt}>{icon.prompt}</p>
                <p className="text-[10px] text-muted-foreground mb-2 capitalize">{icon.perspective}</p>
                <div className="flex gap-1.5 mb-1.5">
                  <button
                    onClick={() => handleCopy(icon)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-[10px] font-semibold hover:bg-muted transition-colors"
                    title="Copy gambar"
                  >
                    {copied === icon.id ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
                    {copied === icon.id ? "Tersalin!" : "Copy"}
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleDownload(icon, false)}
                    disabled={!!downloading}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-[10px] font-semibold hover:bg-muted transition-colors disabled:opacity-50"
                    title="Download dengan background"
                  >
                    {downloading === icon.id ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
                    PNG
                  </button>
                  <button
                    onClick={() => handleDownload(icon, true)}
                    disabled={!!downloading}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-primary/10 text-primary py-1.5 text-[10px] font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
                    title="Download tanpa background (transparan)"
                  >
                    {downloading === icon.id + "-t" ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
                    No BG
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
