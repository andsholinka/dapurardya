"use client";

import { useState } from "react";
import { Wand2, Download, Coins, Loader2, ImageIcon, RefreshCw, ChevronDown, Images, Copy, Check, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { IconPerspective } from "@/lib/imagen";

const PERSPECTIVES: { value: IconPerspective; label: string }[] = [
  { value: "isometric", label: "Isometric" },
  { value: "front", label: "Front Facing" },
  { value: "back", label: "Back Facing" },
  { value: "side", label: "Side Facing" },
  { value: "three-quarter", label: "Three Quarter" },
  { value: "top-down", label: "Top Down" },
];

interface GenerateResult {
  url: string;
  fromCache: boolean;
  credits: number;
  isAdmin?: boolean;
}

export default function IconStudioPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [perspective, setPerspective] = useState<IconPerspective>("isometric");
  const [perspectiveOpen, setPerspectiveOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Resize to max 800px before storing — prevents ECONNRESET on large photos
    const MAX_PX = 800;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) return;
            const resized = new File([blob], file.name, { type: "image/jpeg" });
            setReferenceImage(resized);
            setReferencePreview(URL.createObjectURL(resized));
          },
          "image/jpeg",
          0.85
        );
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function removeReferenceImage() {
    setReferenceImage(null);
    if (referencePreview) URL.revokeObjectURL(referencePreview);
    setReferencePreview(null);
  }

  async function handleCopy() {
    if (!result) return;
    try {
      const res = await fetch(result.url);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Browser tidak mendukung copy gambar. Coba download saja.");
    }
  }

  async function handleGenerate() {
    if ((!prompt.trim() && !referenceImage) || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      let res: Response;
      if (referenceImage) {
        const formData = new FormData();
        formData.append("prompt", prompt.trim());
        formData.append("perspective", perspective);
        formData.append("image", referenceImage);
        res = await fetch("/api/member/icon-studio", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/member/icon-studio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim(), perspective }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal generate icon.");
        if (res.status === 401) window.location.href = "/member/auth?tab=login";
        if (res.status === 403) window.location.href = "/member/upgrade";
        return;
      }
      setResult(data);
      // Sync credits in header instantly
      window.dispatchEvent(new CustomEvent("credits:update", { detail: { credits: data.credits } }));
      router.refresh();
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(transparent: boolean) {
    if (!result) return;
    setDownloading(true);
    try {
      const url = transparent
        ? result.url.replace("/upload/", "/upload/e_background_removal/")
        : result.url;
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `ardya-icon-${prompt.slice(0, 20).replace(/\s+/g, "-")}-${transparent ? "transparent" : "original"}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setError("Gagal download. Coba lagi.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Wand2 className="size-5" />
            </div>
            <h1 className="text-2xl font-bold">Icon Studio</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Deskripsikan apapun — AI akan generate 3D icon unik untukmu. 1 generate = 5 Credits.
          </p>
        </div>
        <Link href="/member/icon-studio/gallery">
          <Button variant="outline" size="sm" className="rounded-xl shrink-0">
            <Images className="size-3.5 mr-1.5" />
            Galeri
          </Button>
        </Link>
      </div>

      {/* Input area */}
      <div className="rounded-2xl border-2 border-border bg-card p-5 mb-6">
        <label className="block text-sm font-semibold mb-2">
          {referenceImage ? "Deskripsi Tambahan (opsional)" : "Deskripsi Icon"}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder={referenceImage ? "Contoh: dengan latar pantai, pose melambai..." : "Contoh: rocket, coffee cup, warung makan..."}
            maxLength={200}
            className="flex-1 rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors h-11"
          />
          <Button onClick={handleGenerate} disabled={(!prompt.trim() && !referenceImage) || loading} className="rounded-xl px-4 font-semibold shrink-0 h-11">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
            <span className="ml-1.5 hidden sm:inline">{loading ? "Generating..." : "Generate"}</span>
            <span className="ml-1.5 sm:hidden">{loading ? "..." : "Go"}</span>
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-right">{prompt.length}/200</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">View:</span>
          <div className="relative">
            <button
              onClick={() => setPerspectiveOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-xl border-2 border-border bg-background px-3 py-1.5 text-xs font-semibold hover:border-primary/50 transition-colors"
            >
              {PERSPECTIVES.find((p) => p.value === perspective)?.label}
              <ChevronDown className="size-3" />
            </button>
            {perspectiveOpen && (
              <div className="absolute left-0 top-full mt-1 z-20 w-40 rounded-xl border-2 border-border bg-background shadow-lg overflow-hidden">
                {PERSPECTIVES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => { setPerspective(p.value); setPerspectiveOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted ${perspective === p.value ? "bg-primary/10 font-semibold text-primary" : ""}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reference image upload */}
        <div className="mt-3">
          <p className="text-xs text-muted-foreground font-medium mb-2">Referensi Gambar (opsional):</p>
          {referencePreview ? (
            <div className="flex items-center gap-3">
              <div className="relative size-16 rounded-xl overflow-hidden border-2 border-border shrink-0">
                <Image src={referencePreview} alt="Reference" fill className="object-cover" unoptimized />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{referenceImage?.name}</p>
                <p className="text-[10px] text-muted-foreground">AI akan generate icon berdasarkan gambar ini</p>
              </div>
              <button onClick={removeReferenceImage} className="text-xs text-destructive hover:underline shrink-0">Hapus</button>
            </div>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-border px-4 py-3 hover:border-primary/50 transition-colors">
              <Upload className="size-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">Upload gambar referensi (JPG, PNG, WebP)</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
          {error.includes("Credit") && (
            <Link href="/member/upgrade" className="ml-auto font-semibold underline shrink-0">Top Up</Link>
          )}
        </div>
      )}

      {loading && (
        <div className="mb-6 rounded-2xl border-2 border-dashed border-border bg-muted/30 aspect-square max-w-xs mx-auto flex flex-col items-center justify-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="size-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute size-9 rounded-full bg-background flex items-center justify-center">
              <Wand2 className="size-5 text-primary" />
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">AI sedang merender iconmu...</p>
        </div>
      )}

      {result && !loading && (
        <div className="mb-8">
          <div className="rounded-2xl border-2 border-primary/20 bg-card p-4 max-w-xs mx-auto">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted/20 mb-4">
              <Image src={result.url} alt={prompt} fill className="object-contain p-4" unoptimized />
            </div>
            <div className="flex gap-2 mb-2">
              <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={() => { setResult(null); setPrompt(""); }}>
                <RefreshCw className="size-3.5 mr-1.5" />
                Baru
              </Button>
              <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={handleCopy} disabled={downloading}>
                {copied ? <Check className="size-3.5 mr-1.5 text-green-600" /> : <Copy className="size-3.5 mr-1.5" />}
                {copied ? "Tersalin!" : "Copy"}
              </Button>
              <Button size="sm" className="flex-1 rounded-xl" onClick={() => handleDownload(false)} disabled={downloading}>
                {downloading ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Download className="size-3.5 mr-1.5" />}
                PNG
              </Button>
            </div>
            <Button variant="outline" size="sm" className="w-full rounded-xl text-primary border-primary/30 hover:bg-primary/5" onClick={() => handleDownload(true)} disabled={downloading}>
              {downloading ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Download className="size-3.5 mr-1.5" />}
              Download Tanpa Background
            </Button>
          </div>
          {result.fromCache ? (
            <p className="text-center text-xs text-blue-600 mt-3">⚡ Dari cache — kredit tidak dipotong</p>
          ) : (
            <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
              {result.isAdmin ? (
                <>
                  <span>∞</span>
                  <span className="font-semibold text-foreground">Unlimited</span>
                </>
              ) : (
                <>
                  <Coins className="size-3" />
                  Sisa kredit: <span className="font-semibold text-foreground">{result.credits}</span>
                </>
              )}
            </p>
          )}
        </div>
      )}

      {!loading && !result && !error && (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 aspect-square max-w-xs mx-auto flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <ImageIcon className="size-12 opacity-30" />
          <p className="text-sm">Icon akan muncul di sini</p>
        </div>
      )}
    </div>
  );
}
