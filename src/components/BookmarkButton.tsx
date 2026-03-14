"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  recipeId: string;
  isMember: boolean;
}

export function BookmarkButton({ recipeId, isMember }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isMember) return;
    fetch("/api/member/bookmarks")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.bookmarks)) {
          setBookmarked(data.bookmarks.includes(recipeId));
        }
      })
      .catch(() => {});
  }, [recipeId, isMember]);

  async function toggle() {
    if (!isMember) {
      window.location.href = "/member/auth?tab=register";
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/member/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      const data = await res.json();
      setBookmarked(data.bookmarked);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={bookmarked ? "Hapus dari tersimpan" : "Simpan resep"}
      className={cn(
        "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border-2 transition-all",
        bookmarked
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
      )}
    >
      <Bookmark className={cn("size-4", bookmarked && "fill-current")} />
      <span>{bookmarked ? "Tersimpan" : "Simpan"}</span>
    </button>
  );
}
