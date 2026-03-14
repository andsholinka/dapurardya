"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (compact) return;
    fetch(`/api/ratings/${recipeId}`)
      .then((r) => r.json())
      .then((d) => {
        setAvg(d.avg ?? 0);
        setCount(d.count ?? 0);
        setUserRating(d.userRating ?? null);
      })
      .catch(() => {});
  }, [recipeId, compact]);

  async function submitRating(star: number) {
    if (!isMember || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ratings/${recipeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: star }),
      });
      const data = await res.json();
      if (res.ok) {
        setAvg(data.avg);
        setCount(data.count);
        setUserRating(data.userRating);
      }
    } finally {
      setLoading(false);
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
              onClick={() => submitRating(star)}
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
        <p className="text-xs text-muted-foreground">Kamu memberi {userRating} bintang</p>
      )}
    </div>
  );
}
