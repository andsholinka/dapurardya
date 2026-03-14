"use client";

import { useState, useEffect } from "react";
import { Star, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RatingStarsProps {
  recipeId: string;
  isMember: boolean;
  /** Tampilan ringkas untuk card (read-only, tanpa fetch) */
  compact?: boolean;
  initialAvg?: number;
  initialCount?: number;
}

export function RatingStars({ recipeId, isMember, compact = false, initialAvg = 0, initialCount = 0 }: RatingStarsProps) {
  const [avg, setAvg] = useState(initialAvg);
  const [count, setCount] = useState(initialCount);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState("");
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (compact) return;
    fetch(`/api/ratings/${recipeId}`)
      .then((r) => r.json())
      .then((d) => {
        setAvg(d.avg ?? 0);
        setCount(d.count ?? 0);
        setUserRating(d.userReview?.rating ?? null);
        setComment(d.userReview?.comment ?? "");
        setImage(d.userReview?.image ?? "");
        setReviews(d.reviews ?? []);
      })
      .catch(() => {});
  }, [recipeId, compact]);

  async function submitReview(star?: number) {
    if (!isMember || loading) return;
    const finalRating = star || userRating;
    if (!finalRating) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/ratings/${recipeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: finalRating, comment, image }),
      });
      const data = await res.json();
      if (res.ok) {
        setAvg(data.avg);
        setCount(data.count);
        setUserRating(data.userReview.rating);
        setComment(data.userReview.comment || "");
        setImage(data.userReview.image || "");
        
        // Update list ulasan secara instan
        setReviews(prev => {
          const filtered = prev.filter(r => r.memberId !== data.userReview.memberId);
          return [data.userReview, ...filtered];
        });

        // Sembunyikan form dan tampilkan feedback sukses
        setShowForm(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !isMember) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setImage(data.url);
    } finally {
      setUploading(false);
    }
  }

  // Tampilan compact untuk RecipeCard (read-only)
  if (compact) {
    if (initialCount === 0) return null;
    return (
      <div className="flex items-center gap-1 mt-1.5">
        <Star className="size-3 fill-amber-400 text-amber-400" />
        <span className="text-xs font-medium text-foreground">{initialAvg.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">({initialCount})</span>
      </div>
    );
  }

  // Tampilan interaktif untuk halaman detail
  const displayRating = hovered || userRating || 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Bintang interaktif */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={!isMember || loading}
              onClick={() => {
                submitReview(star);
                setShowForm(true);
              }}
              onMouseEnter={() => isMember && setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className={cn(
                "transition-transform",
                isMember && !loading ? "hover:scale-110 cursor-pointer" : "cursor-default"
              )}
              title={isMember ? `Beri ${star} bintang` : "Login untuk memberi rating"}
            >
              <Star
                className={cn(
                  "size-6 transition-colors",
                  star <= displayRating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted-foreground/40"
                )}
              />
            </button>
          ))}
        </div>

        {/* Rata-rata & jumlah */}
        {count > 0 ? (
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{avg.toFixed(1)}</span> / 5
            <span className="ml-1">({count} rating)</span>
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Belum ada rating</span>
        )}
      </div>

      {/* Feedback state */}
      {!isMember && (
        <p className="text-xs text-muted-foreground">
          <a href="/member/auth?tab=login" className="text-primary underline">Login</a> untuk memberi rating
        </p>
      )}
      {isMember && userRating && (
        <div className="mt-4">
          {!showForm ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Kamu memberi <span className="font-bold text-foreground">{userRating} bintang</span>
                </p>
                {success && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full animate-pulse">Berhasil disimpan!</span>}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowForm(true)}
                className="text-xs h-7 rounded-lg hover:bg-primary/10 text-primary"
              >
                {comment || image ? "Edit Ulasan" : "Tulis Ulasan / Tambah Foto"}
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">Tulis ulasanmu</p>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              </div>
              <div className="space-y-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan pengalaman memasakmu..."
                  className="w-full min-h-[100px] p-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-0 text-sm transition-all shadow-sm"
                />
                
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Foto Masakan (opsional)</p>
                    {image ? (
                      <div className="relative size-24 rounded-xl overflow-hidden border-2 border-border shadow-md transition-transform hover:scale-105">
                        <img src={image} alt="Ulasan" className="object-cover size-full" />
                        <button 
                          onClick={() => setImage("")}
                          className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center size-24 rounded-xl border-2 border-dashed border-border hover:bg-muted/50 hover:border-primary/50 cursor-pointer transition-all group">
                        <Camera className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-[10px] text-muted-foreground mt-1 group-hover:text-primary">{uploading ? "..." : "Upload"}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                      </label>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => submitReview()} 
                      disabled={loading || uploading} 
                      className="rounded-xl px-6 h-10 shadow-sm transition-all active:scale-95"
                    >
                      {loading ? "Menyimpan..." : "Simpan Ulasan"}
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => setShowForm(false)} 
                      className="rounded-xl h-10 text-muted-foreground"
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review List */}
      {!compact && reviews.length > 0 && (
        <div className="mt-8 space-y-6">
          <h3 className="font-bold text-lg border-b pb-2">Apa kata mereka?</h3>
          <div className="grid gap-6">
            {reviews.map((rev, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 uppercase">
                  {rev.memberName?.charAt(0) || "U"}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{rev.memberName || "User"}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={cn("size-3", s <= rev.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/20")} 
                        />
                      ))}
                    </div>
                  </div>
                  {rev.comment && <p className="text-sm text-foreground/80 leading-relaxed">{rev.comment}</p>}
                  {rev.image && (
                    <div className="mt-2 rounded-xl overflow-hidden border bg-muted max-w-[200px]">
                      <img src={rev.image} alt="Review" className="w-full h-auto object-cover" />
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground pt-1">
                    {new Date(rev.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
