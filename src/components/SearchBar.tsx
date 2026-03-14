"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const CATEGORIES = ["Semua", "Makanan", "Minuman", "Cemilan"];

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (category) params.set("category", category);
      router.push(`/resep${params.toString() ? `?${params}` : ""}`);
    },
    [q, category, router]
  );

  function selectCategory(cat: string) {
    const val = cat === "Semua" ? "" : cat;
    setCategory(val);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (val) params.set("category", val);
    router.push(`/resep${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="space-y-3 w-full">
      <form onSubmit={submit} className="flex gap-2 w-full max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari resep..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 rounded-xl border-2 bg-background"
            aria-label="Cari resep"
          />
        </div>
        <Button type="submit" size="default" className="rounded-xl shrink-0">
          Cari
        </Button>
      </form>
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const active = cat === "Semua" ? !category : category === cat;
          return (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium border-2 transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
